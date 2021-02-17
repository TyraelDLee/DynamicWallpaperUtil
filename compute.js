function compute() {

    if (CheckInputs()) {

        var f = document.theForm;

        //常量

        var degreesToRadians = 3.1416 / 180.0000;
        var radiansToDegrees = 180.0000 / 3.1416;
        var feetToMeters = 1.0000 / 3.2800;
        var degreeMinutesToDecimal = 1.0000 / 60.0000;
        var degreeSecondsToDecimal = 1.0000 / 3600.0000;

        var inputLongitude = f.inputLongitude.value;
        var inputEastWest = f.inputEastWest.options[f.inputEastWest.selectedIndex].text;
        var inputLatitude = f.inputLatitude.value;
        var inputNorthSouth = f.inputNorthSouth.options[f.inputNorthSouth.selectedIndex].text;
        var inputElevation = f.inputElevation.value;
        var inputFeetMeters = f.inputFeetMeters.options[f.inputFeetMeters.selectedIndex].text;
        var inputMonth = f.inputMonth.options[f.inputMonth.selectedIndex].text;
        var inputDate = f.inputDate.options[f.inputDate.selectedIndex].text - 0;
        var inputYear = f.inputYear.options[f.inputYear.selectedIndex].text - 0;
        var inputTime = f.inputTime.value;
        var inputAMPM = f.inputAMPM.options[f.inputAMPM.selectedIndex].text;
        var inputTimeFormat = f.inputTimeFormat.options[f.inputTimeFormat.selectedIndex].text;
        var inputTimeZone = f.inputTimeZone.options[f.inputTimeZone.selectedIndex].value - 0;
        var inputDaylight = f.inputDaylight.options[f.inputDaylight.selectedIndex].text;
        var inputZeroAzimuth = f.inputZeroAzimuth.options[f.inputZeroAzimuth.selectedIndex].value - 0;


        if (inputLongitude.indexOf("d") != -1) {

            degMarker = inputLongitude.indexOf("d");
            minMarker = inputLongitude.indexOf("m");
            secMarker = inputLongitude.indexOf("s");

            longitudeDeg = inputLongitude.substr(0, degMarker) - 0;
            longitudeMin = inputLongitude.substr(degMarker + 1, minMarker - degMarker - 1) - 0;
            longitudeSec = inputLongitude.substr(minMarker + 1, secMarker - minMarker - 1) - 0;

            inputLongitude = longitudeDeg + (longitudeMin * degreeMinutesToDecimal) + (longitudeSec * degreeSecondsToDecimal);
        } else {
            inputLongitude -= 0;
        }

        if (inputLatitude.indexOf("d") != -1) {

            degMarker = inputLatitude.indexOf("d");
            minMarker = inputLatitude.indexOf("m");
            secMarker = inputLatitude.indexOf("s");

            LatitudeDeg = inputLatitude.substr(0, degMarker) - 0;
            LatitudeMin = inputLatitude.substr(degMarker + 1, minMarker - degMarker - 1) - 0;
            LatitudeSec = inputLatitude.substr(minMarker + 1, secMarker - minMarker - 1) - 0;

            inputLatitude = LatitudeDeg + (LatitudeMin * degreeMinutesToDecimal) + (LatitudeSec * degreeSecondsToDecimal);
        } else {
            inputLatitude -= 0;
        }

        //检查输入值的有效性

        var validInputTime = true;

        // 避免由于纬度或经度数学错误 = 0

        if ((inputLatitude == 0) && (f.inputLatitude.value.length > 0)) {
            inputLatitude = 0.000000001;
        }
        if ((inputLongitude == 0) && (f.inputLongitude.value.length > 0)) {
            inputLongitude = 0.000000001;
        }

        //检查输入的字段都由用户填写

        var timeEntered = (inputTime != "");
        var latitudeEntered = (inputLatitude != "");
        var longitudeEntered = (inputLongitude != "");

        // 将输入的字符串转换为数字

        inputLatitude = inputLatitude - 0;
        inputLongitude = inputLongitude - 0;
        inputElevation = inputElevation - 0;

        // 确定时间格式

        var clockTimeInputMode = (inputTimeFormat == "Clock time");
        var lsotInputMode = (inputTimeFormat == "Solar time");

        //

        var doableDeclination = true;
        var doableEOT = true;
        var doableClockTime = ((longitudeEntered || clockTimeInputMode) && timeEntered);
        var doableLSOT = ((longitudeEntered || lsotInputMode) && timeEntered);
        var doableHourAngle = (longitudeEntered && timeEntered);
        var doableSunRiseSet = (longitudeEntered && latitudeEntered);
        var doableAltitude = (longitudeEntered && timeEntered && latitudeEntered);
        var doableAzimuth = (longitudeEntered && timeEntered && latitudeEntered);


        // //////////// //
        //计算//
        // //////////// //

        // 转换单位

        // 经度东-西调整

        if (longitudeEntered) {
            var signedLongitude = inputLongitude;
            if (inputEastWest == "East") signedLongitude *= -1;      // [0] = 东, [1] = 西
        }

        // 纬度南北调整

        if (latitudeEntered) {
            var signedLatitude = inputLatitude;
            if (inputNorthSouth == "South") signedLatitude *= -1;      // [0] = 北, [1] = 南
        }

        // 修复经度 > 180 deg

        if (signedLongitude > 180)
            signedLongitude = signedLongitude - 360;

        // 修复经度< -180 deg
        if (signedLongitude < -180)
            signedLongitude = signedLongitude + 360;


        // 日光节约时间的调整，计算
        var daylightAdjustment = 0;
        if (inputDaylight == "Yes") daylightAdjustment = 1;

        // 如果有必要，转换高度单位

        if (inputFeetMeters == "feet") {
            inputElevation *= feetToMeters;
        }

        //设置为零的方位

        zeroAzimuth = inputZeroAzimuth;

        // 当地标准时间子午线

        var meridian = inputTimeZone * -15;

        // 如果太多与时区经度不同的警报

        var longitudeMeridianDifference = signedLongitude - meridian;

        if ((!showedLongitudeMeridianWarning) && ((longitudeMeridianDifference > 30) || (longitudeMeridianDifference < -30))) {

            alert("警告:  经度从选定的时区中心相差超过30度.  这可能是正确的, 或者它可能表明，其中一个输入是不正确的.\n\n请点击 '时区' 输入的详细信息.\n\n(不会再次显示这个警告.)");

            showedLongitudeMeridianWarning = true;
        }

        // 计算时间

        // 转换时间输入午后小时

        if (validInputTime) {

            // ...如果有必要从时间字符串删除分号

            inputTime = RemoveSemicolon(inputTime);

            // ...解析时间输入的字符串并得到小时和分钟

            if (inputTime.length == 4) {                          // 如 "1234"
                timeHours = inputTime.substring(0, 2) - 0;
                timeMinutes = inputTime.substring(2, 4) - 0;
            } else {                                                // 如 "123"
                timeHours = inputTime.substring(0, 1) - 0;
                timeMinutes = inputTime.substring(1, 3) - 0;
            }

            // ...调整为 AM/PM 名称

            if ((inputAMPM == "AM") && (timeHours == 12)) timeHours = 0;
            if (inputAMPM == "PM") {
                if (timeHours != 12) timeHours += 12;
            }

            // ...计算后午夜的时钟分钟

            var inputHoursAfterMidnight = timeHours + timeMinutes / 60.0;
            var inputMinutesAfterMidnight = timeHours * 60.0 + timeMinutes;
        }

        // 计算通用时间

        var UT = 0.0;

        if (validInputTime) {
            UT = inputHoursAfterMidnight - inputTimeZone - daylightAdjustment;
        }

        var monthNum = (MonthStringToMonthNum(inputMonth)) - 0;

        if (monthNum > 2) {
            correctedYear = inputYear;
            correctedMonth = monthNum - 3;
        } else {
            correctedYear = inputYear - 1;
            correctedMonth = monthNum + 9;
        }

        var t = ((UT / 24.0) + inputDate + Math.floor(30.6 * correctedMonth + 0.5) + Math.floor(365.25 * (correctedYear - 1976)) - 8707.5) / 36525.0;

        var G = 357.528 + 35999.05 * t;
        G = NormalizeTo360(G);

        var C = (1.915 * Math.sin(G * degreesToRadians)) + (0.020 * Math.sin(2.0 * G * degreesToRadians));

        var L = 280.460 + (36000.770 * t) + C;
        L = NormalizeTo360(L);

        var alpha = L - 2.466 * Math.sin(2.0 * L * degreesToRadians) + 0.053 * Math.sin(4.0 * L * degreesToRadians);

        var GHA = UT * 15 - 180 - C + L - alpha;
        GHA = NormalizeTo360(GHA);

        var obliquity = 23.4393 - 0.013 * t;

        var declination = Math.atan(Math.tan(obliquity * degreesToRadians) * Math.sin(alpha * degreesToRadians)) * radiansToDegrees;

        f.outputDeclination.value = FormatFloatString(declination);

        var eotAdjustment = (L - C - alpha) / 15.0;

        f.outputEOT.value = FormatFloatString(eotAdjustment);

        if (doableLSOT || doableClockTime) {

            var clockTimeToLSOTAdjustment = ((signedLongitude - meridian) / 15.0) - eotAdjustment + daylightAdjustment;   // 以小时为单位
        }

        var solarHourAngle = 0;

        if (clockTimeInputMode) {
            solarHourAngle = GHA - signedLongitude;
        } else {
            solarHourAngle = 15 * (inputHoursAfterMidnight - 12);
        }

        solarHourAngle = NormalizeTo180(solarHourAngle);

        var apparentSolarTime = 0;

        if (clockTimeInputMode) {
            apparentSolarTime = NormalizeTo24(12 + solarHourAngle / 15.0);
        } else {
            apparentSolarTime = inputHoursAfterMidnight;
        }

        if (doableLSOT) {

            if (clockTimeInputMode) {

                solarMinutesAfterMidnight = inputMinutesAfterMidnight - (clockTimeToLSOTAdjustment * 60.0);

                var whichDay = 0;

                if (solarMinutesAfterMidnight < 0) {
                    solarMinutesAfterMidnight += 24 * 60;
                    whichDay = -1;
                }

                if (solarMinutesAfterMidnight >= 24 * 60) {
                    solarMinutesAfterMidnight -= 24 * 60;
                    whichDay = 1;
                }
            } else {

                solarMinutesAfterMidnight = inputMinutesAfterMidnight;

                whichDay = 0;
            }

            solarTime = MinutesToClockTime(solarMinutesAfterMidnight, inputAMPM);

            if (whichDay == "-1") f.outputLSOT.value = solarTime + "-";
            if (whichDay == "0") f.outputLSOT.value = solarTime;
            if (whichDay == "1") f.outputLSOT.value = solarTime + "+";
        } else {
            f.outputLSOT.value = "";
        }

        if (doableClockTime) {

            var clockMinutesAfterMidnight = inputMinutesAfterMidnight;

            if (lsotInputMode) {
                clockMinutesAfterMidnight = inputMinutesAfterMidnight + (clockTimeToLSOTAdjustment * 60.0);
            }

            var whichDay = 0;

            if (clockMinutesAfterMidnight < 0) {
                clockMinutesAfterMidnight += 24 * 60;
                whichDay = -1;
            }

            if (clockMinutesAfterMidnight >= 24 * 60) {
                clockMinutesAfterMidnight -= 24 * 60;
                whichDay = 1;
            }

            clockTime = MinutesToClockTime(clockMinutesAfterMidnight, inputAMPM);

            if (whichDay == "-1") f.outputClockTime.value = clockTime + "-";
            if (whichDay == "0") f.outputClockTime.value = clockTime;
            if (whichDay == "1") f.outputClockTime.value = clockTime + "+";
        } else {
            f.outputClockTime.value = "";
        }

        // 小时角

        // 不同之间 180 和 + 180 度

        if (doableHourAngle) {

            var hourAngle = (solarMinutesAfterMidnight - (12 * 60)) / 4;

            f.outputHourAngle.value = FormatFloatString(hourAngle);
        } else {
            f.outputHourAngle.value = "";
        }

        //地平高度角

        if (doableAltitude) {

            var altitudeAngle = radiansToDegrees * Math.acos(
                (Math.sin(signedLatitude * degreesToRadians) *
                    Math.sin(declination * degreesToRadians)) -
                (Math.cos(signedLatitude * degreesToRadians) *
                    Math.cos(declination * degreesToRadians) *
                    Math.cos((solarHourAngle + 180) * degreesToRadians)));

            f.outputAltitude.value = FormatFloatString(altitudeAngle);
        } else {
            f.outputAltitude.value = "";
        }

        // 方位角

        if (doableAzimuth) {

            var preAzimuthAngle = radiansToDegrees * Math.acos(
                (Math.cos(declination * degreesToRadians) *
                    ((Math.cos(signedLatitude * degreesToRadians) *
                        Math.tan(declination * degreesToRadians)) +
                        (Math.sin(signedLatitude * degreesToRadians) *
                            Math.cos((solarHourAngle + 180) * degreesToRadians)))) /
                Math.cos(altitudeAngle * degreesToRadians));

            azimuthAngle = preAzimuthAngle + (zeroAzimuth - 180.0);

            // 方位角的正确标志


            if (zeroAzimuth == 0) {

                azimuthAngle = ChangeSign(azimuthAngle, "same", hourAngle);
            }

            //北零方位

            else {

                azimuthAngle = ChangeSign(azimuthAngle, "opposite", hourAngle);
            }

            f.outputAzimuth.value = FormatFloatString(azimuthAngle);
        } else {
            f.outputAzimuth.value = "";
        }

        // 时钟时间的日出与日落

        if (doableSunRiseSet) {
            var sunRiseSetLSoTMinutes = radiansToDegrees * Math.acos(-1.0 *
                (Math.sin(signedLatitude * degreesToRadians) *
                    Math.sin(declination * degreesToRadians) -
                    Math.sin((-0.8333 - 0.0347 * Math.sqrt(inputElevation)) * degreesToRadians)) /
                Math.cos(signedLatitude * degreesToRadians) /
                Math.cos(declination * degreesToRadians)) * 4;

            f.outputSunrise.value = MinutesToClockTime((12 * 60 - sunRiseSetLSoTMinutes + (clockTimeToLSOTAdjustment * 60)), inputAMPM);

            f.outputSunset.value = MinutesToClockTime((12 * 60 + sunRiseSetLSoTMinutes + (clockTimeToLSOTAdjustment * 60)), inputAMPM);
        } else {
            f.outputSunrise.value = "";
            f.outputSunset.value = "";
        }
    }

    // 零出形式输出，是否输入了无效

    else {

        var f = document.theForm;

        f.outputAltitude.value = '';
        f.outputAzimuth.value = '';
        f.outputDeclination.value = '';
        f.outputEOT.value = '';
        f.outputClockTime.value = '';
        f.outputSunrise.value = '';
        f.outputSunset.value = '';
        f.outputLSOT.value = '';
        f.outputHourAngle.value = '';
    }
    console.log(f.outputAltitude.value);
    console.log(f.outputAzimuth.value);
}
