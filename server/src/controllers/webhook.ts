import { Request, Response } from 'express';
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

function getStationCode(stationName: string, stationData: StationData): string | null {
    const station = stationData.data.find(station => station.name.toLowerCase() === stationName.toLowerCase());
    return station ? station.code : null;
}

export async function findTrains(parameters: Parameters): Promise<any> {
    try {
        const sourceStationName = parameters.Station[0];
        const destinationStationName = parameters.Station[1];

        const sourceCode = getStationCode(sourceStationName, stationData);
        const destinationCode = getStationCode(destinationStationName, stationData);

        if (sourceCode && destinationCode) {
            const response = await axios.get(`${process.env.SERVER_URL}/trains/betweenStations/?from=${sourceCode}&to=${destinationCode}`);

            const trainDataArray = response.data.data;

            if (trainDataArray.length > 0) {
                const fulfillmentMessages = trainDataArray.map((trainDataObj: { train_base: any; }) => {
                    const trainData = trainDataObj.train_base;

                    return {
                     
                            "richContent": [
                                [
                                    {
                                        "type": "accordion",
                                        "title": `${trainData.train_name} (${trainData.train_no})`,
                                        "subtitle": `From ${trainData.from_stn_name} to ${trainData.to_stn_name}`,
                                        "image": {
                                            "src": {
                                                "rawUrl": "https://example.com/images/logo.png"  // Add a relevant image URL if necessary
                                            }
                                        },
                                        "text": `Source: ${trainData.source_stn_name} (${trainData.source_stn_code})\n
                                                Destination: ${trainData.dstn_stn_name} (${trainData.dstn_stn_code})\n
                                                Departure: ${trainData.from_time}\n
                                                Arrival: ${trainData.to_time}\n
                                                Travel Time: ${trainData.travel_time}\n
                                                Running Days: ${trainData.running_days}`
                                    }
                                ]
                            ]
                    
                    };
                });

                return {
                    fulfillmentMessages
                };
            } else {
                return {
                    fulfillmentMessages: [
                        {
                            text: {
                                text: [
                                    `I couldn't find any trains from ${sourceStationName} to ${destinationStationName}. Please check the station names or try again later.`
                                ]
                            }
                        }
                    ]
                };
            }
        } else {
            return {
                fulfillmentMessages: [
                    {
                        text: {
                            text: [
                                `I couldn't find the station codes for ${sourceStationName} or ${destinationStationName}. Please check the station names and try again.`
                            ]
                        }
                    }
                ]
            };
        }
    } catch (err) {
        console.log(err);

        return {
            fulfillmentMessages: [
                {
                    text: {
                        text: [
                            'An error occurred while processing your request. Please try again later.'
                        ]
                    }
                }
            ]
        };
    }
}
