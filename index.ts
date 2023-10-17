// @ts-ignore
import * as fs from 'fs';
import axios from 'axios';
// @ts-ignore
import Papa from 'papaparse';
import dotenv from 'dotenv';
dotenv.config();

const accessToken = process.env.MAPBOX_API_KEY;

interface RowData {
  Tittel: string;
  Adresse: string;
  Kategori: string;
  Latitude?: number;
  Longitude?: number;
}

async function getCoordinates(
  address: string
): Promise<{ latitude: number; longitude: number }> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address
  )}.json?access_token=${accessToken}`;

  try {
    const response = await axios.get(url);
    const [longitude, latitude] =
      response.data.features[0].geometry.coordinates;
    return { latitude, longitude };
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    throw new Error('Failed to fetch coordinates');
  }
}

async function processCsv(): Promise<void> {
  try {
    const inputFiles = fs.readdirSync('./input');
    for (const inputFile of inputFiles) {
      console.log(`Processing ${inputFile}...`);
      const inputCsv = fs.readFileSync(`./input/${inputFile}`, 'utf-8');
      const parseResult = Papa.parse(inputCsv, {
        header: true,
        skipEmptyLines: true,
      });
      const data = parseResult.data as RowData[];
      const results: RowData[] = [];

      for (const row of data) {
        try {
          const coordinates = await getCoordinates(row.Adresse);
          results.push({
            ...row,
            Latitude: coordinates.latitude,
            Longitude: coordinates.longitude,
          });
        } catch (error) {
          console.error(`Failed to geocode address: ${row.Adresse}`);
        }
      }

      const outputCsv = Papa.unparse(results);
      fs.writeFileSync(`./output/${inputFile}`, outputCsv);
    }
    console.log('Processing complete.');
  } catch (error) {
    // @ts-ignore
    console.error('Error processing CSV:', error.message);
  }
}

// Usage:
processCsv().catch((error) => console.error('Error:', error.message));
