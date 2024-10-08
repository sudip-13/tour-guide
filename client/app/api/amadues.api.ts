import axios, { AxiosResponse, CancelTokenSource } from "axios";

const CancelToken = axios.CancelToken;

interface GetAmadeusDataParams {
  keyword?: string;
  page?: number;
  city?: boolean;
  airport?: boolean;
}


interface GetAmadeusDataReturn {
  out: Promise<AxiosResponse<any>>;
  source: CancelTokenSource;
}


interface getFlightstod {
  sourceCode?: string;
  destinationCode?: string;
  selectedDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
}
const config = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  }
};
export const getAmadeusData = (params: GetAmadeusDataParams): GetAmadeusDataReturn => {

  const { keyword = "", page = 0, city = true, airport = true } = params;


  const subTypeCheck = city && airport ? "CITY,AIRPORT" : city ? "CITY" : airport ? "AIRPORT" : "";


  const searchQuery = keyword ? keyword : "a";


  const source = CancelToken.source();


  const out = axios.get(
    `https://tour-guide-r6pt.onrender.com/flight/api/airports/?keyword=${searchQuery}&page=${page}&subType=${subTypeCheck}`,
    {
      cancelToken: source.token,
      ...config
      
    }
  );

  return { out, source };
};


export const getFlightstod = (params: getFlightstod): GetAmadeusDataReturn => {

  const { sourceCode, destinationCode, selectedDate, adults, children, infants } = params;



  const source = CancelToken.source();


  const out = axios.get(
    `https://tour-guide-r6pt.onrender.com/flight/api/flightavailabilities/?sourceCode=${sourceCode}&destinationCode=${destinationCode}&selectedDate=${selectedDate}&adults=${adults}&children=${children}&infants=${infants}`,
    {
      cancelToken: source.token,
      ...config
    }
  );

  return { out, source };

}