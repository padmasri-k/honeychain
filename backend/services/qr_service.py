import qrcode
import os
import json
from io import BytesIO
import base64

from config import QR_CODE_DIR


def generate_qr_code(batch_code: str, verification_url: str = "http://localhost:5173/verify") -> dict:
    """
    Generate a QR code for a honey batch.
    Returns the file path and base64-encoded image.
    """
    # Data encoded in QR
    qr_data = json.dumps({
        "app": "HoneyChain",
        "batch": batch_code,
        "verify": f"{verification_url}/{batch_code}",
    })

    # Generate QR
    qr = qrcode.QRCode(
        version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#b45309", back_color="white")

    # Save to file
    filename = f"qr_{batch_code}.png"
    filepath = os.path.join(QR_CODE_DIR, filename)
    img.save(filepath)

    # Also create base64 for API response
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    b64_string = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {
        "filepath": filepath,
        "filename": filename,
        "base64": f"data:image/png;base64,{b64_string}",
        "batch_code": batch_code,
    }
