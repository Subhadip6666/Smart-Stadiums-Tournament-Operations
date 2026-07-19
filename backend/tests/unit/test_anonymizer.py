from app.utils.anonymizer import anonymize_fan_data

def test_anonymize_fan_data():
    """Verify PII removal and bucketed density output."""
    raw_data = {"user_id": "usr-123", "name": "John Doe", "count": 45}
    sanitized = anonymize_fan_data(raw_data)
    assert "name" not in sanitized
    assert "user_id" not in sanitized
    assert "density_bucket" in sanitized