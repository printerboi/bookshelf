from io import BytesIO
from operator import itemgetter

from PIL import Image, ImageOps, UnidentifiedImageError


class Cover:
    isbn: str
    image: bytearray

    def __init__(self, isbn: str, image: bytearray):
        self.isbn = isbn
        self.image = image

    
    def getMainColor(self) -> str:
        if not isinstance(self.image, (bytes, bytearray, memoryview)):
            raise TypeError("self.image must be bytes, bytearray, or memoryview")

        if not self.image:
            raise ValueError("self.image is empty")

        try:
            with Image.open(BytesIO(self.image)) as source_image:
                # Apply EXIF orientation before processing the image.
                normalized_image = ImageOps.exif_transpose(source_image).convert("RGBA")

                # Reduce processing cost while preserving the overall color distribution.
                normalized_image.thumbnail(
                    (150, 150),
                    Image.Resampling.LANCZOS,
                )

                opaque_pixels = [
                    (red, green, blue)
                    for red, green, blue, alpha in normalized_image.getdata()
                    if alpha >= 128
                ]
        except UnidentifiedImageError as exception:
            raise ValueError("self.image does not contain a supported image") from exception

        if not opaque_pixels:
            raise ValueError("The image does not contain any visible pixels")

        pixel_sample = Image.new("RGB", (len(opaque_pixels), 1))
        pixel_sample.putdata(opaque_pixels)

        quantized_image = pixel_sample.quantize(
            colors=8,
            method=Image.Quantize.MEDIANCUT,
            dither=Image.Dither.NONE,
        )

        color_counts = quantized_image.getcolors(maxcolors=8)

        if not color_counts:
            raise ValueError("Could not determine the dominant color")

        _, dominant_palette_index = max(
            color_counts,
            key=itemgetter(0),
        )

        color_palette = quantized_image.getpalette()

        if color_palette is None:
            raise ValueError("The quantized image has no color palette")

        palette_offset = dominant_palette_index * 3

        red = color_palette[palette_offset]
        green = color_palette[palette_offset + 1]
        blue = color_palette[palette_offset + 2]

        return f"#{red:02x}{green:02x}{blue:02x}"
    
    def getTextColor(self) -> str:
        background_color = self.getMainColor().lstrip("#")

        if len(background_color) != 6:
            raise ValueError("getMainColor() must return a color in #RRGGBB format")

        red = int(background_color[0:2], 16) / 255
        green = int(background_color[2:4], 16) / 255
        blue = int(background_color[4:6], 16) / 255

        def convertToLinearColorChannel(color_channel: float) -> float:
            if color_channel <= 0.04045:
                return color_channel / 12.92

            return ((color_channel + 0.055) / 1.055) ** 2.4

        linear_red = convertToLinearColorChannel(red)
        linear_green = convertToLinearColorChannel(green)
        linear_blue = convertToLinearColorChannel(blue)

        relative_luminance = (
            0.2126 * linear_red
            + 0.7152 * linear_green
            + 0.0722 * linear_blue
        )

        white_contrast_ratio = 1.05 / (relative_luminance + 0.05)
        black_contrast_ratio = (relative_luminance + 0.05) / 0.05

        if black_contrast_ratio > white_contrast_ratio:
            return "#000000"

        return "#ffffff"