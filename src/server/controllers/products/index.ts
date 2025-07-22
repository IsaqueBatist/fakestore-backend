import * as addDetail from './AddDetail';
import * as create from './Create';
import * as deleteById from './DeleteById';
import * as getAll from './GetAll';
import * as getById from './GetById';
import * as updateById from './UpdateById';
import * as deleteDetail from './DeleteDetail'
import * as updateDetail from './UpdateDetail'
import * as getDetail from './GetDetail'


export const ProductController = {
  ...create,
  ...getAll,
  ...getById,
  ...updateById,
  ...deleteById,
  ...addDetail,
  ...deleteDetail,
  ...updateDetail,
  ...getDetail
};