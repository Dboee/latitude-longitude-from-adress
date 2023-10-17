"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("browser-fs-access"));
// @ts-ignore
const papaparse_1 = __importDefault(require("papaparse"));
const accessToken = 'your-mapbox-access-token-here'; // Replace with your Mapbox access token
function getCoordinates(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${accessToken}`;
        try {
            const response = yield axios_1.default.get(url);
            const [longitude, latitude] = response.data.features[0].geometry.coordinates;
            return { latitude, longitude };
        }
        catch (error) {
            console.error('Error fetching coordinates:', error);
            throw new Error('Failed to fetch coordinates');
        }
    });
}
function processCsv() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inputFile = yield fs.fileOpen({ mimeTypes: ['text/csv'] });
            const inputCsv = yield inputFile.text();
            const parseResult = papaparse_1.default.parse(inputCsv, {
                header: true,
                skipEmptyLines: true,
            });
            const data = parseResult.data;
            const results = []; // Explicitly type the results array
            for (const row of data) {
                try {
                    const coordinates = yield getCoordinates(row.Adresse);
                    results.push(Object.assign(Object.assign({}, row), { Latitude: coordinates.latitude, Longitude: coordinates.longitude }));
                }
                catch (error) {
                    console.error(`Failed to geocode address: ${row.Adresse}`);
                }
            }
            const outputCsv = papaparse_1.default.unparse(results);
            const blob = new Blob([outputCsv], { type: 'text/csv' });
            yield fs.fileSave(blob, { fileName: 'output.csv' });
        }
        catch (error) {
            // @ts-ignore
            console.error('Error processing CSV:', error.message);
        }
    });
}
// Usage:
processCsv().catch((error) => console.error('Error:', error.message));
