interface LoaderProps {
  text?: string;
}

export default function Loader({ text = 'Loading...' }: LoaderProps) {
  return <p className="text-sm font-semibold text-[#717744]">{text}</p>;
}