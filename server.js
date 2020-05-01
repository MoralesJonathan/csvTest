const server = require('express')(),
  port = process.env.PORT || 8080,
  environment = server.get('env'),
  logger = require('morgan'),
  multer  = require('multer'),
  storage = multer.memoryStorage(),
  upload = multer({ storage: storage }),
  { StringDecoder } = require('string_decoder'),
  decoder = new StringDecoder('utf8'),
  csv = require('csv-string'),
  bodyParser = require('body-parser');
  

server
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(logger('dev'))

  .post('/upload', upload.single('testcsv'), function(req, res) {
    const csvBuff = req.file.buffer;
    const decodedCsv = decoder.write(csvBuff);
    const parsedCsv = csv.parse(decodedCsv);
    const csvHeaders = parsedCsv.shift();
    let defaultColOrder;
    if(csvHeaders[0].toLowerCase() == 'name' && csvHeaders[1].toLowerCase() == 'phone') {
      defaultColOrder = true;
    } else if (csvHeaders[0].toLowerCase() == 'phone' && csvHeaders[1].toLowerCase() == 'name') {
      defaultColOrder = false;
    } else {
      return res.status(400).send('Invalid CSV headers', 400);
    }
    const csvData = parsedCsv.map(row => {
      row[0] = !row[0]? null : row[0];
      row[1] = !row[1]? null : row[1];
      if(defaultColOrder){
        return {
          name: row[0],
          phone: row[1]
        }
      } else {
        return {
          name: row[1],
          phone: row[0]
        }
      }
    })
    console.log("csvData", csvData);
    res.status(200).send('CSV processed');
  })

  .listen(port, () => {
    console.log(`Server is running on port ${port} and is running with a ${environment} environment.`);
  });