"use strict"

function myFunction() {
    var x = document.getElementById("myTextarea").value;
    const json = x;

    var wynik = document.getElementById("wynik");
    var bledy = document.getElementById("wynik");
    wynik.innerHTML = "";
    bledy.innerHTML = "";
    try {
        const obj = JSON.parse(json);
      
        const jsonType = obj.type;
        const jsonGeometry = obj.geometry;

        if('Feature' !== jsonType){
            bledy.innerHTML += "Brak pola o wartości 'Feature'"+ "<br />"
        }
        if( !obj.hasOwnProperty('geometry')){
            bledy.innerHTML +="Brak pola 'geometry'"+ "<br />";
        }
        if( !obj.hasOwnProperty('properties')){
            bledy.innerHTML +="Brak pola 'properties'"+ "<br />";
        }
        if( !('type' in jsonGeometry) || 'LineString' !== jsonGeometry.type){
            bledy.innerHTML +="Brak pola 'type' o wartości 'LineString'"+ "<br />";
        }
        if(!('coordinates' in jsonGeometry)){
            bledy.innerHTML +="Brak pola 'coordinates'"+ "<br />";
        }
        if( jsonGeometry.coordinates.length < 2){
            bledy.innerHTML +="Zbyt mała ilość koordynatów"+ "<br />";
        }

        for(let i=0;i < jsonGeometry.coordinates.length;i++){
            if(typeof jsonGeometry.coordinates[i][0] !== 'number' &&  typeof jsonGeometry.coordinates[i][1] !== 'number'){
                bledy.innerHTML +="Dane są nieprawidłowe"+ "<br />";
            }
            if(jsonGeometry.coordinates[i].length < 2){
                bledy.innerHTML +="Zbyt mała ilość danych o współrzędnych"+ "<br />";
            }
        }
        if(bledy.innerHTML !== ""){
            return;
        }

        let suma = 0;
        for(let i=1;i < jsonGeometry.coordinates.length;i++){
            const lon_1 = jsonGeometry.coordinates[i - 1][0];
            const lat_1 = jsonGeometry.coordinates[i - 1][1];
            const lon_2 = jsonGeometry.coordinates[i][0];
            const lat_2 = jsonGeometry.coordinates[i][1];
            let dystans = distance(lon_1,lat_1,lon_2,lat_2);
            suma += dystans;
            wynik.innerHTML += i + "-->" + (i + 1) + "  :  " + dystans + " metrów <br />";
        }
        wynik.innerHTML += "Razem: " + suma + " metrów <br />";
    } catch (e) {
        if (e instanceof SyntaxError) {
            wynik.innerHTML +="Błąd składni!";
        } else {
            wynik.innerHTML +="Nieznany błąd";
        }
    }

}
function distance(lon_1, lat_1, lon_2, lat_2){

    var a = 6378137,b = 6356752.3142,f = 1 / 298.257223563;

    const L = (lon_2 - lon_1) * Math.PI / 180; // L = difference in longitude, U = reduced latitude, defined by tan U = (1-f)·tanφ.
    const tanU1 = (1-f) * Math.tan(lat_1* Math.PI / 180), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
    const tanU2 = (1-f) * Math.tan(lat_2* Math.PI / 180), cosU2 = 1 / Math.sqrt((1 + tanU2*tanU2)), sinU2 = tanU2 * cosU2;

    let lambda = L, sinlambda = null, coslambda = null;    // lambda = difference in longitude on an auxiliary sphere
    let sigma = null, sinsigma = null, cossigma = null; // sigma = angular distance P₁ P₂ on the sphere
    let cos2sigma_m = null;                      // sigma_m = angular distance on the sphere from the equator to the midpoint of the line
    let cosSqalpha = null;                      // alpha = azimuth of the geodesic at the equator
    let lambda_prev = null;

    while (Math.abs(lambda-lambda_prev) > 1e-12){
        sinlambda = Math.sin(lambda);
        coslambda = Math.cos(lambda);
        const sinSqsigma = (cosU2 * sinlambda) * (cosU2 * sinlambda) + (cosU1 * sinU2-sinU1 * cosU2 * coslambda)**2;
        sinsigma = Math.sqrt(sinSqsigma);
        cossigma = sinU1 * sinU2 + cosU1 * cosU2 * coslambda;
        sigma = Math.atan2(sinsigma, cossigma);
        const sinalpha = cosU1 * cosU2 * sinlambda / sinsigma;
        cosSqalpha = 1 - sinalpha*sinalpha;
        cos2sigma_m = cossigma - 2 * sinU1 * sinU2/cosSqalpha;
        const C = f / 16 * cosSqalpha * (4 + f * (4 - 3 *cosSqalpha));
        lambda_prev = lambda;
        lambda = L + (1 - C) * f * sinalpha * (sigma + C * sinsigma * (cos2sigma_m + C * cossigma * (-1 + 2 * cos2sigma_m * cos2sigma_m)));
    }
    const uSq = cosSqalpha * (a  *a - b * b) / (b * b);
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq*(74 - 47 * uSq)));

    const deltasigma = B * sinsigma * (cos2sigma_m + B / 4 * (cossigma * (-1 + 2 * cos2sigma_m * cos2sigma_m)- B / 6 * cos2sigma_m * (-3 + 4 * sinsigma * sinsigma) * (-3 + 4 * cos2sigma_m * cos2sigma_m)));
    const s = b * A * (sigma - deltasigma); // s = length of the geodesic
    // const alpha1 = Math.atan2(cosU2 * sinlambda,  cosU1 * sinU2 - sinU1 * cosU2 * coslambda); // initial bearing
    // const alpha2 = Math.atan2(cosU1 * sinlambda, -sinU1 * cosU2 + cosU1 * sinU2 * coslambda); // final bearing
    return s;
}

