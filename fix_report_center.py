with open("src/pos-app/components/ReportCenter.tsx", "r") as f:
    lines = f.readlines()

out = []
for i, line in enumerate(lines):
    if i >= 388 and i <= 399:
        if i == 388:
            out.append('          <button onClick={doPrint}\n')
        elif i == 389:
            out.append('            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white transition">\n')
        elif i == 390:
            out.append('            <Printer className="w-3.5 h-3.5" /> {tt(lang, \'প্রিন্ট\', \'Print\')}\n')
        elif i == 391:
            out.append('          </button>\n')
        elif i == 392:
            out.append('        </div>\n')
        elif i == 393:
            out.append('        )}\n')
        elif i == 394:
            out.append('      </div>\n')
        elif i == 395:
            out.append('\n')
        elif i == 396:
            out.append('      {/* Error banner */}\n')
        elif i == 397:
            out.append('      {(error || ledgerError) && (\n')
        elif i == 398:
            out.append('        <div className="rounded-xl bg-rose-950/60 border border-rose-500/50 p-3 flex items-start gap-2 text-rose-100 text-sm">\n')
        elif i == 399:
            out.append('          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />\n')
    else:
        out.append(line)

with open("src/pos-app/components/ReportCenter.tsx", "w") as f:
    f.writelines(out)
