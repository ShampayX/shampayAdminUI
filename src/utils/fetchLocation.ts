export const fetchLocation = async () => {
  let location: any = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  await fetch("https://api.ipify.org?format=json")
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("ip", data.ip);
    });
  localStorage.setItem("lat", location.coords.latitude);
  localStorage.setItem("long", location.coords.longitude);
  return location;
};
