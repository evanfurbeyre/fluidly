import { data } from '../../data/data';

export default function handler(_: any, res: any) {
  res.status(200).json(Object.keys(data));
}
