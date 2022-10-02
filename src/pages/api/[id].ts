import { data } from '../../data/data';

export default function handler({ query: { id } }: any, res: any) {
  res.status(200).json(data[id]);
}
