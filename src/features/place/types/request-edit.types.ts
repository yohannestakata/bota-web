import type { z } from "zod";
import type { requestEditSchema } from "../schemas/request-edit.schema";

export type RequestEditFormValues = z.infer<typeof requestEditSchema>;
