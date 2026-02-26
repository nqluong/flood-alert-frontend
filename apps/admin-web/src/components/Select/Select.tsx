import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

type Option<T> = {
    value: T;
    label: string;
};

type Props<T> = {
    options: Option<T>[];
    value: T;
    onChange: (v: T) => void;
    className?: string;
};

export default function Select<T>({ options, value, onChange, className }: Props<T>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const toggle = () => setOpen((v) => !v);
    const close = () => setOpen(false);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) close();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className={`select${className ? ` ${className}` : ''}`} ref={ref}>
            <button className="select__trigger" onClick={toggle}>
                <span>{options.find(o => o.value === value)?.label ?? String(value)}</span>
                <ChevronDown size={16} className={`select__chevron${open ? ' is-open' : ''}`} />
            </button>

            {open && (
                <ul className="select__menu">
                    {options.map((opt) => (
                        <li
                            key={String(opt.value)}
                            className={`select__option ${opt.value === value ? 'is-selected' : ''}`}
                            onClick={() => {
                                onChange(opt.value);
                                close();
                            }}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}