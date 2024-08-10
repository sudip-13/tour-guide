const fs = require('fs');


const stationData = require('D:\\tour-guide-1\\client\\data\\Indian Railway Train Numbers & Names.json');


const dialogflowEntities = {
  entities: stationData.trains.map(trains => ({
    value: trains.number,
    synonyms: [trains.number, trains.number, trains.number]

  }))
};


fs.writeFileSync('D:\\tour-guide-1\\client\\data\\train_no.json', JSON.stringify(dialogflowEntities, null, 2));

console.log('Dialogflow entities file created successfully.');
