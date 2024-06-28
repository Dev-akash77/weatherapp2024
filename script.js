let search=document.querySelector('.fa-magnifying-glass');
let focus=document.querySelector('.fa-location-crosshairs');
let input=document.querySelector('input');
let curTemp_city=document.querySelector('.current_temp');
let curWeatherIcon=document.querySelector('.current_data_weather_images_main');
let current_day=document.querySelector('.current_day');
let current_time=document.querySelector('.current_time');
let mostly=document.querySelector('.mostly');
let rain_chance=document.querySelector('.rain_chance');
let country_name=document.querySelector('.country_name');
let country_main=document.querySelector('.country_main');
let five_day_main=document.querySelector('.fiveday');
let wind=document.querySelector('.wind');
let air=document.querySelector('.air');
let Visibility=document.querySelector('.Visibility');
let humidity=document.querySelector('.humidity');
let hd_c=document.querySelector('.hd_c');
let uv_index=document.querySelector('.uv_index');
let sunset_time=document.querySelector('.sunset_time');
let sunrise_time=document.querySelector('.sunrise_time');
let url="https://api.openweathermap.org/data/2.5/weather?units=metric&q="
let apikey="e23c5126b76c0d5ae40bb7dd7712f727";
function getAirQualityDescription(aqi) {
    switch (aqi) {
        case 1:
            return 'Good';
        case 2:
            return 'Fair';
        case 3:
            return 'Moderate';
        case 4:
            return 'Poor';
        case 5:
            return 'Very Poor';
        default:
            return 'Unknown';
    }
}
function convertMillisecondsToDays(milliseconds) {
    const date = new Date(milliseconds);
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOfWeek[date.getUTCDay()];
}

function gettime(date){
  let curTime=new Date().toLocaleTimeString();
  current_time.innerText=`${curTime}`;
}
 function showdata(data){
    curTemp_city.innerHTML=`${Math.round(data.main.temp)}°<sup><span>c</span></sup> <span class='city'>(${data.name})</span>`;
    mostly.innerText=data.weather[0].description;
    curWeatherIcon.innerHTML=` <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="sunny waether">`
    let date=data.dt; 
    // Example usage:
    const milliseconds = new Date(date*1000);
    const days = convertMillisecondsToDays(milliseconds);
    current_day.innerText=days+',';
    gettime(date);
    setInterval(()=>{
        gettime()
    },1000);

    let rainchance=data.rain;
    if(rainchance){
        rain_chance.innerText=`Rain - ${(data.rain['1h']*10).toFixed(2)}%`
    }else{
        rain_chance.innerText=`Rain - 0%`
    }
    wind.innerText=data.wind.speed
    Visibility.innerText=data.visibility/1000;
    humidity.innerText=data.main.humidity;
    hd_c.style.transform=` translateY(-${(data.main.humidity)*3}%)`
    let sunrise= new Date(data.sys.sunrise*1000);
    const options={
        hour:"numeric",
        minute: "numeric"
    }
    let formatter= new Intl.DateTimeFormat("en-us",options);
    // sunrise time
    let sunriseTime=formatter.format(sunrise);
    sunrise_time.innerText=`${sunriseTime}`;
    let sunset=new Date(data.sys.sunset*1000);
    // sun set time
    let sunsetTime=formatter.format(sunset)
    sunset_time.innerText=`${sunsetTime}`;
 }

async function flag(code){

    let res=await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    let data= await res.json();
    let countryn=new Intl.DisplayNames([code], {type: 'region'}).of(code);
    let continents=data[0].continents[0]
    country_name.innerText=`${countryn}, ${code}, ${continents}`;
    country_main.style.backgroundImage=`linear-gradient(rgba(0, 0, 0, .4), rgba(0, 0, 0,1)),url(${data[0].flags.svg})`;
}

async function fetchWeather(city_name){
    if (!city_name) {
        alert('enter city name')
        return false
    }
    //main data
    fetch(`${url}${city_name}&appid=${apikey}`).then(response=>{
        return response.json()
    }).then(data=>{
        if (data.cod=='404') {
            alert('city name not find')
            return false
        }
        showdata(data);
        flag(data.sys.country);
        let {lon,lat}=data.coord;
        // let lon=data.coord.lon;
        // uv index
        let curTime= new Date((data.dt + data.timezone)* 1000);
        let time=curTime.getUTCHours();
        if (time>=6 && time<=18) {
            fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apikey}`).then(res=>{
                return res.json()
            }).then(data=>{
                uv_index.innerText=(data.value).toFixed(0)/7;
            })
        }else{
            uv_index.innerText='0';
        }
        // polution
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apikey}`).then(res=>{
            return res.json();
          }).then(data=>{
            let aq=data.list[0].main.aqi;
            air.innerText=getAirQualityDescription(aq);
          })
    })
// forcast data
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city_name}&units=metric&appid=${apikey}`).then(response=>{
        return response.json()
    }).then(data=>{
        if (data.cod=='404') {
            return false
        }
        let forcastDataList=data.list;
        five_day_main.innerHTML='';
        let days={};
        //looping data
        forcastDataList.forEach((curElem)=>{
         let date = new Date(curElem.dt_txt);
         let day=date.toLocaleDateString('en-us',{weekday:'short'});
         if(!days[day]){
            days[day]={
             temp:curElem.main.temp,
             discription:curElem.weather[0].description,
             icon:curElem.weather[0].icon,
             rain:curElem.rain,
            }
         }
        });
     
        Object.keys(days).slice(0,6).forEach((curData)=>{
         let weekday=document.createElement('div');
         weekday.classList.add('weekday');
         weekday.innerHTML=`
         <p class="wday">
                        ${curData}
                     </p>
                     <div class="wimage_main">
                         <img src="http://openweathermap.org/img/wn/${days[curData].icon}@4x.png" alt="sunny waether">
                     </div>
                     <p class="w_twmp">${days[curData].temp}°C</p>
                     <p class="fd">${days[curData].discription}</p>
         `
         five_day_main.appendChild(weekday);
      })
    })

}
search.addEventListener('click',()=>{
    fetchWeather(input.value.trim());
    input.value=''
})
// fetchWeather('kalna');
//get user current location
let map_api='https://api.opencagedata.com/geocode/v1/json?';
let map_apikey='93c330823cd542b2ae0ffba8d833c38e';
const showcurrentlocation= async (latitude,longitude)=>{
    let query=`${latitude},${longitude}`
    let main_current_location=`${map_api}key=${map_apikey}&q=${query}&pretty=1&no_annotations=1`;
    let response = await fetch(main_current_location);
    let data= await response.json();
   let currentstate=data.results[0].components.state;
   fetchWeather(currentstate);
//    forcastdata(currentstate);
}
const currentlocation=()=>{
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position)=>{
           let {latitude,longitude}=position.coords;
           showcurrentlocation(latitude,longitude)
        },(error)=>{});
      }
}
focus.addEventListener('click',()=>{
    // fetchWeather(input.value);
    var name = "your location is been secure don't warry"
    alert(name)
    currentlocation();
})
currentlocation();

// loader animation
let loader = document.querySelector(".lodare_main");
let html = document.querySelector("html");
window.onload=()=>{
    loader.style.display = "none";
    html.style.overflowY="auto";
}
