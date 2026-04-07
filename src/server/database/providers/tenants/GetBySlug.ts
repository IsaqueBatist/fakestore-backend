import { EtableNames } from "../../ETableNames";
import { ITenant } from "../../models";
import { Knex } from "../../knex";

export const getBySlug = async (slug: string): Promise<ITenant | undefined> => {
  return Knex(EtableNames.tenants).where("slug", slug).first();
};
