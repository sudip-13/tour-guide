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

interface TrainData {
    train_base: {
        train_name: string;
        train_no: string;
        from_stn_name: string;
        to_stn_name: string;
        source_stn_name: string;
        source_stn_code: string;
        dstn_stn_name: string;
        dstn_stn_code: string;
        from_time: string;
        to_time: string;
        travel_time: string;
        running_days: string;
    };
}

export async function findTrains(parameters: Parameters): Promise<string> {
    try {
        const sourceStationName = parameters.Station[0];
        const destinationStationName = parameters.Station[1];

        const sourceCode = getStationCode(sourceStationName, stationData);
        const destinationCode = getStationCode(destinationStationName, stationData);

        if (sourceCode && destinationCode) {
            const response = await axios.get<TrainData[]>(`${process.env.SERVER_URL}/trains/betweenStations/?from=${sourceCode}&to=${destinationCode}`);

            const trainDataArray = response.data;

            if (trainDataArray.length > 0) {
                const result = {
                    fulfillmentMessages: trainDataArray.map(trainDataObj => ({
                        richContent: [
                            [
                                {
                                    type: 'accordion',
                                    title: `${trainDataObj.train_base.train_name} (${trainDataObj.train_base.train_no})`,
                                    subtitle: `From ${trainDataObj.train_base.from_stn_name} to ${trainDataObj.train_base.to_stn_name}`,
                                    image: {
                                        src: {
                                            rawUrl: 'https://example.com/images/logo.png'
                                        }
                                    },
                                    text: `Source: ${trainDataObj.train_base.source_stn_name} (${trainDataObj.train_base.source_stn_code})\n
                                                Destination: ${trainDataObj.train_base.dstn_stn_name} (${trainDataObj.train_base.dstn_stn_code})\n
                                                Departure: ${trainDataObj.train_base.from_time}\n
                                                Arrival: ${trainDataObj.train_base.to_time}\n
                                                Travel Time: ${trainDataObj.train_base.travel_time}\n
                                                Running Days: ${trainDataObj.train_base.running_days}`
                                }
                            ]
                        ]
                    }))
                };

                return JSON.stringify(result);

            } else {
                const errorMessage = {
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
                return JSON.stringify(errorMessage); 
            }
        } else {
            const errorMessage = {
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
            return JSON.stringify(errorMessage); 
        }
    } catch (err) {
        console.log(err);

        const errorMessage = {
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
        return JSON.stringify(errorMessage); // Convert error message object to JSON string
    }
}

function getStationCode(stationName: string, stationData: StationData): string | null {
    const station = stationData.data.find(station => station.name.toLowerCase() === stationName.toLowerCase());
    return station ? station.code : null;
}
