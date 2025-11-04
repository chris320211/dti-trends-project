import express, { Express } from "express";
import cors from 'cors';

const app: Express = express();
const port = 1010;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'DTI Trends Project API is running!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});