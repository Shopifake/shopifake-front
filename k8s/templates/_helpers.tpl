{{- define "shopifake-front.name" -}}
shopifake-front
{{- end }}

{{- define "shopifake-front.fullname" -}}
{{- printf "%s" (include "shopifake-front.name" .) -}}
{{- end }}
