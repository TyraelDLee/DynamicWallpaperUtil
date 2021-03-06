/***
 * Copyright Copyright 2021 Tyrael Lee, Y. LI
 ***/

const FOREGROUND = document.createElement("div");
const BACKGROUND = document.createElement("div");
var index = 1, next = -1;
var la = 0, lo = 0;
var JSON;

function initial(){
    const PARENT = document.body;
    FOREGROUND.setAttribute("id", "fore");
    FOREGROUND.style.background = "url(background/1.png) no-repeat center";
    FOREGROUND.style.backgroundSize = "cover";
    FOREGROUND.innerHTML = "<!---->";
    BACKGROUND.setAttribute("id", "back");
    BACKGROUND.style.background = "url(background/1.png) no-repeat center";
    BACKGROUND.style.backgroundSize = "cover";
    BACKGROUND.innerHTML = "<!---->";
    FOREGROUND.classList.add("background");
    BACKGROUND.classList.add("background");
    PARENT.appendChild(BACKGROUND);
    PARENT.appendChild(FOREGROUND);
}



// Get location and load JSON timetable
$(function (){
    $.ajax({
        url: "http://ip-api.com/json/",
        type: "GET",
        dataType: "json",
        json: "callback",
        success: function (data){
            la = data["lat"];
            lo = data["lon"];
            console.log("lat: " + la + " lon: " + lo)
        }
    })
    $.ajax({
        url: "./background/TimeTable.json",
        type: "GET",
        dataType: "json",
        success: function (data){
            JSON = data["dict"];
        }
    })
});

function timeLocation(){
    // Test use
    // la = -53.48;
    // lo = -0.84;
    let time = new Date();

    // get day light
    let TimeOffset = -(new Date(2021,1,1).getTimezoneOffset()<new Date(2021,6,1).getTimezoneOffset()?new Date(2021,6,1).getTimezoneOffset():new Date(2021,1,1).getTimezoneOffset());
    //
    // Calculation
    // N0 = 79.6764 + 0.2422 * (Year - 1985) - INT(0.25 * (Year - 1985))
    // dN = N - N0
    let numOfDay = Math.ceil((new Date() - new Date(new Date().getFullYear().toString()))/(24*60*60*1000))-1;
    let N0 = (79.6764 + 0.2422 *(time.getFullYear() - 1985) - Math.ceil((time.getFullYear()-1985)/4.0));
    let dN = (Math.abs(lo) / 15.0 + time.getHours() + time.getMinutes() / 60.0);
    if(lo<0)
        dN = (0 - dN) / 24.0;
    else
        dN = dN / 24.0;
    let theta = 2*Math.PI * (numOfDay + dN - N0) / 365.242;
    let Declination = 0.3723+23.2567 * Math.sin(theta) + 0.1149* Math.sin(theta*2) - 0.1712* Math.sin(theta*3) -
        0.758* Math.cos(theta)+0.3656* Math.cos(theta*2)+0.0201* Math.cos(theta*3);
    let TrueSunTime = ((time.getUTCHours()+TimeOffset/60)%24 * 60 + time.getMinutes() +
        (0.0028 - 1.9857 * Math.sin(theta) + 9.9059 * Math.sin(2 * theta) - 7.0924 * Math.cos(theta)
            - 0.6882 * Math.cos(2 * theta)))/60.0;
    let SolarHourAngle = 15.0 * (TrueSunTime - 12);
    // Solar Elevation
    let Alt = R2D(Math.asin(
        Math.cos(D2R(SolarHourAngle)) * Math.cos(D2R(Declination)) * Math.cos(D2R(la))
        + Math.sin(D2R(Declination)) * Math.sin(D2R(la))
    ));
    // Solar Azimuth
    let A = ((Math.sin(D2R(Alt)) * Math.sin(D2R(la)) - Math.sin(D2R(Declination))) /
        Math.cos(D2R(Alt)) * Math.cos(la));
    let Azi = (SolarHourAngle<=0)?R2D(Math.acos(A)):360-R2D(Math.acos(A));
    calculationDis(Alt, Azi);

    if(index!==next){
        FOREGROUND.style.background = "url(background/"+(next)+".png) no-repeat fixed center";
        FOREGROUND.style.backgroundSize = "cover";
        FOREGROUND.style.zIndex = "-1";
        window.setTimeout(setBGCSS, 200);
    }
}

function setBGCSS(){
    BACKGROUND.classList.add("background-fadeOut");
    window.setTimeout(wait, 1000);
}

function wait(){
    index = next;
    BACKGROUND.classList.remove("background-fadeOut");
    BACKGROUND.style.background = "url(background/" + index + ".png) no-repeat center"
    BACKGROUND.style.backgroundSize = "cover";
}

function calculationDis(alt, azi){
    let diff = 1000, s;
    let data = [];
    let index = 0;
    if(alt<-9 && azi > 180)
        next = next = (Number(JSON[JSON.length-1].i)+1);
    else{
        for (let i = 0; i < JSON.length; i++) {
            if (Math.abs(JSON[i].a - alt)<diff){
                diff = Math.abs(JSON[i].a - alt);
                s = JSON[i].a;
            }
        }
        for (let i = 0; i < JSON.length; i++) {
            if(JSON[i].a === s){
                data[index] = JSON[i];
                index++;
            }
        }
        diff = 1000;
        for (let i = 0; i < data.length; i++) {
            if (Math.abs(data[i].z - azi)<diff){
                diff = Math.abs(data[i].z - azi);
                s = data[i].z;
            }
        }
        for (let i = 0; i < data.length; i++) {
            if(data[i].z === s)
                next = (Number(data[i].i)+1);
        }
    }
}

function D2R(degree){
    return degree * 3.14159 / 180.0
}

function R2D(radius){
    return  radius / 3.14159 * 180.0;
}

window.onload = function (){
    initial();
}

window.setInterval(timeLocation,1000);