export default function ListaFaq({ perguntas }) {
  return (
    <div className="space-y-3">
      {perguntas.map(({ id, pergunta, resposta, fonte }) => (
        <details key={id} id={`pergunta-${id}`} className="group rounded-2xl border border-naf-gray/40 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-5 text-left font-bold text-naf-blue hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red [&::-webkit-details-marker]:hidden">
            <span>{pergunta}</span>
            <svg className="h-5 w-5 shrink-0 text-naf-red transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-5 pb-5 leading-relaxed text-gray-700">
            <p>{resposta}</p>
            {fonte && (
              <a href={fonte.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded text-sm font-medium text-naf-blue underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red">
                {fonte.texto} (abre em outra aba)
              </a>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
