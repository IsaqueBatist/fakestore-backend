import * as create from './Create';
import * as getAll from './GetAll'
import * as getById from './GetById'
import * as updateById from './UpdateById'
import * as deleteById from './DeleteById'
import * as count from './Count'

import * as addDetail from './AddDetail'
import * as updateDetail from './UpdateDetail'
import * as deleteDetail from './DeleteDetail'
import * as getDetail from './GetDetail'

import * as addCategory from './AddCategory'
import * as deleteCategory from './DeleteCategory'
import * as getAllCategories from './GetAllCategories'

export const ProductProvider = {
  ...create,
  ...deleteById,
  ...getAll,
  ...getById,
  ...updateById,
  ...count,
  ...addDetail,
  ...updateDetail,
  ...deleteDetail,
  ...getDetail,
  ...addCategory,
  ...deleteCategory,
  ...getAllCategories
};