import Joi from 'joi';

const anyErrors = {
  required: '!!Required',
  empty: '!!Required'
};

export const postSchemaInsert = Joi.object().keys({
  title: Joi.string().trim().label('Title').required().options({
    language: {
      any: anyErrors,
      string: {
        min: '!!Please add a title to your post'
      }
    }
  }),
  details: Joi.string().trim().label('Details').required().options({
    language: {
      any: anyErrors,
      string: {
        min: '!!Please enter your blog post'
      }
    }
  })
});
