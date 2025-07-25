import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteById = async (addressId: number, userId: number): Promise<void | Error> => {
    try {
      const address = await Knex(EtableNames.addresses).select().where('id_address', addressId).first()
      
      if(!address) return new Error('Address not found')

      if(Number(address.user_id) !== userId) return new Error('You do not have permission to delete this address.')
      
      await Knex(EtableNames.addresses).where('id_address', addressId).del()
      
      return
  } catch (error) {
    console.error(error)
    return new Error(`Error deleting record with`);
  }
}