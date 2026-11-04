import Logboek from '@/components/Logboek';

export const dynamic = 'force-dynamic';

export default function Pagina({ params }: { params: { token: string } }) {
  return <Logboek token={params.token} />;
}
