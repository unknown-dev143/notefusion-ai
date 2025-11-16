import React, { FormEvent, ReactNode } from 'react';
import { Form, FormProps } from 'antd';
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';

type ValidatedFormProps<T> = {
  children: ReactNode;
  onFinish?: (values: T) => void;
  onFinishFailed?: (errorInfo: ValidateErrorEntity<T>) => void;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'inline';
  initialValues?: Partial<T>;
  form?: any; // Ant Design form instance
  validateMessages?: any;
  onValuesChange?: (changedValues: any, allValues: T) => void;
} & Omit<FormProps, 'onFinish'>;

const defaultValidateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} is not a valid number!',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
  },
};

function ValidatedForm<T = any>({
  children,
  onFinish,
  onFinishFailed,
  className = '',
  layout = 'vertical',
  initialValues,
  form,
  validateMessages = {},
  onValuesChange,
  ...rest
}: ValidatedFormProps<T>) {
  const handleFinishFailed = (errorInfo: ValidateErrorEntity<T>) => {
    console.log('Validation Failed:', errorInfo);
    if (onFinishFailed) {
      onFinishFailed(errorInfo);
    }
  };

  return (
    <Form
      {...rest}
      form={form}
      layout={layout}
      className={`validated-form ${className}`}
      onFinish={onFinish}
      onFinishFailed={handleFinishFailed}
      initialValues={initialValues}
      validateMessages={{ ...defaultValidateMessages, ...validateMessages }}
      onValuesChange={onValuesChange}
    >
      {children}
    </Form>
  );
}

export default ValidatedForm;
