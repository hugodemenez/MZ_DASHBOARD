s = "JPV221501 - SAS DECATHLON FRANCE-31/12-JPV-AUDITLEGAL-2022"

import re

print((s.split("-"))[1].split("-")[0])


result = re.search('-(.*)-', s)
print(result.group(1))