import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IAddress } from "../../models/Addresses";

export const updateById = async (addressId: number, newAddress: Omit<IAddress, 'id_address' | 'user_id'>, userId: number): Promise<void | Error> => {
  try {

    const address = await Knex(EtableNames.addresses).select().where('id_address', addressId).first()

    if(!address) return new Error('Address not found')

    if(Number(address.user_id) !== userId) return new Error('You do not have permission to update this address.')
      
    const updatedRows = await Knex(EtableNames.addresses).where('id_address', addressId).update(newAddress)
    
    if(updatedRows > 0) return
    
    return new Error(`Error updating address.`);
  } catch (error) {
    console.error(error)
    return new Error(`Error updating address.`);
  }
}