from app.core.config import settings

def test_required_settings_are_loaded_without_printing_secrets():
    assert settings.SECRET_KEY
    assert settings.ALGORITHM
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES > 0
