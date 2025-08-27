import type { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const safeAsync = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args);
    } catch (err) {
      throw err;
    }
  };
};

// export const jsonToExcel = (jsonPath: string, excelPath: string, cellCharLimit = 50) => {
// 	if (!fs.existsSync(jsonPath)) {
// 		throw new Error(`El archivo JSON no existe: ${jsonPath}`);
// 	}

// 	const rawData = fs.readFileSync(jsonPath, "utf-8");
// 	const jsonData = JSON.parse(rawData);

// 	const formattedData = jsonData.map((u: any) => {
// 		const base: Record<string, any> = {
// 			Usuario: u.user_or_team,
// 			Rol: u.role || "",
// 			Branch: u.branch || "",
// 		};

// 		if (Array.isArray(u.repo)) {
// 			let cellIndex = 1;
// 			let currentCell = "";

// 			u.repo.forEach((repo: string, idx: number) => {
// 				const append = currentCell ? `, ${repo}` : repo;

// 				if ((currentCell + append).length > cellCharLimit) {

// 					base[`Repo ${cellIndex}`] = currentCell;
// 					cellIndex++;
// 					currentCell = repo;
// 				} else {
// 					currentCell += append;
// 				}

// 				if (idx === u.repo.length - 1) {
// 					base[`Repo ${cellIndex}`] = currentCell;
// 				}
// 			});
// 		}

// 		return base;
// 	});

// 	const worksheet = XLSX.utils.json_to_sheet(formattedData);
// 	const workbook = XLSX.utils.book_new();
// 	XLSX.utils.book_append_sheet(workbook, worksheet, "Roles_Usuarios");

// 	XLSX.writeFile(workbook, excelPath);
// 	console.log(`Archivo Excel generado en: ${excelPath}`);
// };