import pgPromise from 'pg-promise';

const pgp = pgPromise({});

export const db = pgp('postgres://postgres:123456@localhost:5438/test');