import { Request,Response } from 'express';
import stationData from '../../data/stationcode.json';
import { Parameters } from '../routes/webhook';
import axios from 'axios';

interface Station {
    name: string;
    code: string;
}

interface StationData {
    data: Station[];
}
interface TrainBase {
    train_name: string;
    train_no: string;
    source_stn_name: string;
    source_stn_code: string;
    dstn_stn_name: string;
    dstn_stn_code: string;
    from_stn_name: string;
    to_stn_name: string;
    from_time: string;
    to_time: string;
    travel_time: string;
    running_days: string;
}

interface TrainData {
    train_base: TrainBase;
}

interface TrainApiResponse {
    data: TrainData[];
}

// Define the structure of the Dialogflow request
interface DialogflowRequest {
    queryResult: {
        parameters: {
            Station: string[];
        };
    };
}

// Define the structure of the response object
interface FulfillmentMessage {
    card?: {
        title: string;
        subtitle: string;
        formattedText: string;
        buttons: {
            text: string;
            postback: string;
        }[];
    };
    text?: {
        text: string[];
    };
}

interface FulfillmentResponse {
    fulfillmentMessages: FulfillmentMessage[];
}
function getStationCode(stationName: string, stationData: StationData): string | null {
    const station = stationData.data.find(station => station.name.toLowerCase() === stationName.toLowerCase());
    return station ? station.code : null;
}

export async function findTrains(parameters: Parameters): Promise<any> {

    // const dfMessenger = document.querySelector('df-messenger');
    // const payload = [
    //   {
    //     "type": "info",
    //     "title": "Info item title",
    //     "subtitle": "Info item subtitle",
    //     "image": {
    //       "src": {
    //         "rawUrl": "https://example.com/images/logo.png"
    //       }
    //     },
    //     "actionLink": "https://example.com"
    //   }];
    // dfMessenger?.renderCustomCard(payload);


    try {

        const sourceStationName = parameters.Station[0];
        const destinationStationName = parameters.Station[1];

  
        const sourceCode = getStationCode(sourceStationName, stationData);
        const destinationCode = getStationCode(destinationStationName, stationData);

        if (sourceCode && destinationCode) {
   
            const response = await axios.get<TrainApiResponse>(`${process.env.SERVER_URL}/trains/betweenStations/?from=${sourceCode}&to=${destinationCode}`);
            const trainDataArray = response.data.data;

            if (trainDataArray.length > 0) {
     
                const limitedTrainDataArray = trainDataArray.slice(0, 10);

     
                const fulfillmentMessages: FulfillmentMessage[] = limitedTrainDataArray.map((trainDataObj: TrainData) => {
                    const trainData = trainDataObj.train_base;
                    return {
                        card: {
                            title: `${trainData.train_name} (${trainData.train_no})`,
                            subtitle: `From ${trainData.from_stn_name} to ${trainData.to_stn_name}`,
                            formattedText: `
                                Source: ${trainData.source_stn_name} (${trainData.source_stn_code})\n
                                Destination: ${trainData.dstn_stn_name} (${trainData.dstn_stn_code})\n
                                Departure: ${trainData.from_time}\n
                                Arrival: ${trainData.to_time}\n
                                Travel Time: ${trainData.travel_time}\n
                                Running Days: ${trainData.running_days}
                            `,
                            buttons: [
                                {
                                    text: "Book Now",
                                    postback: "https://www.irctc.co.in/nget/train-search"
                                }
                            ]
                        }
                    };
                });

                return{
                    fulfillmentMessages
                }
                
            } else {
                Response.json({
                    fulfillmentMessages: [
                        {
                            text: {
                                text: [
                                    `I couldn't find any trains from ${sourceStationName} to ${destinationStationName}. Please check the station names or try again later.`
                                ]
                            }
                        }
                    ]
                });
            }
        } else {
            Response.json({
                fulfillmentMessages: [
                    {
                        text: {
                            text: [
                                `I couldn't find the station codes for ${sourceStationName} or ${destinationStationName}. Please check the station names and try again.`
                            ]
                        }
                    }
                ]
            });
        }
    } catch (err) {
        console.error(err);

        Response.json({
            fulfillmentMessages: [
                {
                    text: {
                        text: [
                            'An error occurred while processing your request. Please try again later.'
                        ]
                    }
                }
            ]
        });
    }
}
