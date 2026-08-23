with open("src/pos-app/components/ReportCenter.tsx", "r") as f:
    lines = f.readlines()

out = []
for i, line in enumerate(lines):
    # lines 427-429 (0-indexed 426-428)
    if i == 427:
        out.append('            )}\n')
    elif i == 428:
        pass # delete this line
    # lines 457-458 (0-indexed 456-457)
    elif i == 457:
        pass # delete this line
    else:
        out.append(line)

with open("src/pos-app/components/ReportCenter.tsx", "w") as f:
    f.writelines(out)
