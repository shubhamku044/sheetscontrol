import Link from 'next/link';
import Image from 'next/image';

interface LinkProps {
  authorizationUrl: string;
}

const GoogleSignIn = ({ authorizationUrl }: LinkProps) => {
  return (
    <Link
      href={authorizationUrl}
      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition duration-150 hover:border-slate-400 hover:text-slate-900 hover:shadow dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-300"
    >
      <Image
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        width={24}
        height={24}
        alt="Google logo"
        className="h-6 w-6"
      />
      <span>Login with Google</span>
    </Link>
  );
};

export default GoogleSignIn;
