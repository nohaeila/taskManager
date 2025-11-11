import type { Request, Response, NextFunction } from 'express';

//  À chaque requête reçue, le middleware affiche dans la console la date/heure, la méthode HTTP et l’URL appelée. 
export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};