import { openDB } from '../openDB';

export interface Model {
  model: string;
  count: number;
}

export async function getModels(make: string) {
  const db = await openDB();
  const model = await db.all<Model[]>(
    `
        SELECT model, count(*) as count
        FROM car
        WHERE make = @brand
        GROUP BY model
    `,
    { '@brand': make }
  );
  return model;
}
