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

import * as addComment from './AddComment'
import * as deleteComment from './DeleteComment'
import * as getAllComments from './GetAllComents'
import * as updateComment from './UpdateComment'

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
  ...getAllCategories,
  ...addComment,
  ...deleteComment,
  ...getAllComments,
  ...updateComment
};