import { cn } from '@/utils/cn';
import { Label } from './label';
import { forwardRef, useMemo } from 'react';
import SelectBase, {
  type SelectInstance,
  type Props as SelectProps,
} from 'react-select';

export type SelectOptionProps = {
  label: any;
  value: string;
  isDisabled?: boolean;
  optionImage?: React.ReactNode;
  optionLabel?: React.ReactNode;
};

type InfiniteScrollProps = {
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
};

type BaseSelectProps = Omit<
  SelectProps<SelectOptionProps, boolean>,
  'options' | 'onChange' | 'value' | 'defaultValue'
> & {
  datalist: SelectOptionProps[];
  value?: string | string[] | SelectOptionProps | SelectOptionProps[] | null;
  label?: string;
  disabled?: boolean;
  hideClear?: boolean;
  errorMsg?: string;
  defValue?: string | string[];
  containerClassName?: string;
  infiniteScroll?: InfiniteScrollProps;
};

type SinglSelectProps = BaseSelectProps & {
  isMulti?: false;
  onChange?: (selected: string | null) => void;
};

type MultiSelectProps = BaseSelectProps & {
  isMulti: true;
  onChange?: (selected: string[]) => void;
};

export type CustomSelectProps = SinglSelectProps | MultiSelectProps;

const SelectInput = forwardRef<
  SelectInstance<SelectOptionProps, boolean>,
  CustomSelectProps
>(function SelectInput(
  {
    label,
    datalist = [],
    defValue,
    value: propValue,
    errorMsg,
    required,
    disabled,
    containerClassName,
    onChange,
    infiniteScroll,
    hideClear,
    ...props
  },
  ref,
) {
  const hasError = Boolean(errorMsg && errorMsg.trim());

  // Resolve controlled or default value from string/object to react-select option object
  const resolvedValue = useMemo(() => {
    if (propValue === undefined) {
      if (defValue === undefined) return undefined;
      if (Array.isArray(defValue)) {
        return datalist.filter((item) => defValue.includes(item.value));
      }
      return datalist.find((item) => item.value === defValue) || null;
    }

    if (propValue === null || propValue === '') return null;

    if (typeof propValue === 'string') {
      return datalist.find((item) => item.value === propValue) || null;
    }

    if (Array.isArray(propValue)) {
      if (typeof propValue[0] === 'string') {
        return datalist.filter((item) =>
          (propValue as string[]).includes(item.value),
        );
      }
      return propValue as SelectOptionProps[];
    }

    return propValue as SelectOptionProps | null;
  }, [propValue, defValue, datalist]);

  const defaultResolvedValue = useMemo(() => {
    if (defValue === undefined) return undefined;
    if (Array.isArray(defValue)) {
      return datalist.filter((item) => defValue.includes(item.value));
    }
    return datalist.find((item) => item.value === defValue) || null;
  }, [defValue, datalist]);

  return (
    <div className={cn('flex flex-col gap-2 w-full', containerClassName)}>
      {label && (
        <Label>
          {label}
          {required && <sup className="text-red-500">*</sup>}
        </Label>
      )}

      <SelectBase
        ref={ref}
        options={datalist}
        value={resolvedValue}
        defaultValue={defaultResolvedValue}
        isMulti={props.isMulti}
        isDisabled={disabled}
        isClearable={!hideClear}
        unstyled
        menuPosition="absolute"
        menuPortalTarget={
          typeof document !== 'undefined' ? document.body : undefined
        }
        menuShouldScrollIntoView={false}
        closeMenuOnSelect={!props.isMulti}
        placeholder={props.placeholder ?? 'Not Selected'}
        isOptionDisabled={(option) => !!option.isDisabled}
        getOptionLabel={(option) =>
          typeof option.label === 'string' ? option.label : String(option.value)
        }
        getOptionValue={(option) => option.value}
        formatOptionLabel={(option) => option.optionLabel ?? option.label}
        styles={{
          menuPortal: (base) => ({
            ...base,
            zIndex: 99999,
          }),
        }}
        onMenuScrollToBottom={() => {
          if (infiniteScroll?.hasMore && !infiniteScroll?.loading) {
            infiniteScroll.onLoadMore?.();
          }
        }}
        noOptionsMessage={() =>
          infiniteScroll?.loading ? 'Loading...' : 'No options'
        }
        onChange={(val) => {
          if (props.isMulti) {
            const values = Array.isArray(val)
              ? val.map((item) => item.value)
              : [];

            (onChange as MultiSelectProps['onChange'])?.(values);
          } else {
            const value = (val as SelectOptionProps | null)?.value;

            (onChange as SinglSelectProps['onChange'])?.(value ?? null);
          }
        }}
        classNames={{
          control: () =>
            cn(
              '!min-h-[40px] !px-3 border rounded-lg bg-neutral-3 dark:bg-gray-800 text-sm border-gray-200 dark:border-gray-700 cursor-pointer flex items-center justify-between',
              hasError && 'bg-white border-red-500',
              disabled && 'bg-[#D0D3D9] text-neutral-9 cursor-not-allowed',
            ),

          menu: () =>
            'mt-2 py-2 border rounded-lg text-sm border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-md bg-white z-[99999]',

          multiValue: () => 'gap-1 py-1.5 px-2 mr-1',

          multiValueRemove: () => 'mt-0.5 px-0 mr-0',

          option: ({ isFocused, isSelected }) =>
            cn(
              '!flex items-center min-h-9 px-3 border-l-2 border-transparent !text-sm hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-500 cursor-pointer',
              (isFocused || isSelected) &&
                'bg-blue-50 dark:bg-gray-700 border-blue-500',
            ),

          placeholder: ({ isDisabled }) =>
            cn('text-gray-400', isDisabled && 'text-neutral-9'),

          valueContainer: () => 'flex items-center gap-1.5 flex-1 stroke-0 mr-2',

          indicatorsContainer: () => 'flex items-center gap-1',

          clearIndicator: () => 'stroke-0 mr-1 text-gray-400 cursor-pointer hover:text-gray-600',

          dropdownIndicator: () => 'stroke-0 mr-0 text-gray-400 cursor-pointer hover:text-gray-600',
        }}
        {...props}
      />

      {hasError && <p className="text-sm text-red-500">{errorMsg}</p>}
    </div>
  );
});

export { SelectInput };
