import axios from "axios";

const CancelToken = axios.CancelToken;

export const getAmadeusData = params => {

  // Destructuring params
  const { keyword = "", page = 0, city = true, airport = true } = params;

  // Checking for proper subType 
  const subTypeCheck = city && airport ? "CITY,AIRPORT" : city ? "CITY" : airport ? "AIRPORT" : ""

  // Amadeus API require at least 1 character, so with this we can be sure that we can make this request
  const searchQuery = keyword ? keyword : "a";

  // This is extra tool for cancelation request, to avoid overload API 
  const source = CancelToken.source();

  // GET request with all params we need
  const out = axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/airports/?keyword=${searchQuery}&page=${page}&subType=${subTypeCheck}`,
    {
      cancelToken: source.token
    }
  )

  return { out, source }
};