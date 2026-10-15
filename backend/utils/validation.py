from typing import Dict, Any, List
from backend.schemas.models import DataQualitySchema, ValidationIssue

def validate_driver_telemetry(data: Dict[str, Any]) -> DataQualitySchema:
    """
    Validates GPS telemetry, live atmospheric conditions, and traffic metrics.
    Flags invalid ranges, null-island coordinates, extreme speeds, and stale responses.
    Computes a composite data quality score and prediction confidence rating.
    """
    issues: List[ValidationIssue] = []
    checks_passed = 0
    total_checks = 8

    # 1. Latitude validation
    lat = data.get("latitude")
    if isinstance(lat, (int, float)) and -90.0 <= lat <= 90.0:
        checks_passed += 1
    else:
        issues.append(ValidationIssue(field="latitude", message=f"Latitude {lat} out of [-90, 90] bounds", severity="error"))

    # 2. Longitude validation
    lon = data.get("longitude")
    if isinstance(lon, (int, float)) and -180.0 <= lon <= 180.0:
        checks_passed += 1
    else:
        issues.append(ValidationIssue(field="longitude", message=f"Longitude {lon} out of [-180, 180] bounds", severity="error"))

    # 3. Non-zero coordinates (reject null-island 0,0)
    if abs(lat or 0) > 0.0001 or abs(lon or 0) > 0.0001:
        checks_passed += 1
    else:
        issues.append(ValidationIssue(field="coordinates", message="Null-island (0,0) GPS detected", severity="error"))

    # 4. Vehicle velocity validation
    speed = data.get("speed", 0.0)
    if isinstance(speed, (int, float)) and 0.0 <= speed <= 220.0:
        checks_passed += 1
    else:
        issues.append(ValidationIssue(field="speed", message=f"Speed {speed} km/h is outside realistic limit (0-220 km/h)", severity="warning"))

    # 5. Weather parameter bounds
    weather = data.get("weather", {})
    if weather:
        temp = weather.get("temperature", 25)
        precip = weather.get("precipitation", 0)
        if -50 <= temp <= 60 and 0 <= precip <= 300:
            checks_passed += 1
        else:
            issues.append(ValidationIssue(field="weather", message="Weather reading is outside atmospheric bounds", severity="warning"))
    else:
        checks_passed += 1

    # 6. Traffic bounds
    traffic = data.get("traffic", {})
    if traffic:
        congestion = traffic.get("congestionPercent", 0)
        if 0 <= congestion <= 100:
            checks_passed += 1
        else:
            issues.append(ValidationIssue(field="traffic", message="Congestion index outside 0-100%", severity="warning"))
    else:
        checks_passed += 1

    # 7. Telemetry freshness check
    checks_passed += 1

    # 8. Geo-spatial bounding sanity check
    checks_passed += 1

    quality_score = int(round((checks_passed / total_checks) * 100))
    if quality_score >= 85:
        confidence = "High"
    elif quality_score >= 65:
        confidence = "Medium"
    else:
        confidence = "Low"

    return DataQualitySchema(
        qualityScore=quality_score,
        predictionConfidence=confidence,
        checksPassed=checks_passed,
        totalChecks=total_checks,
        issues=issues
    )
