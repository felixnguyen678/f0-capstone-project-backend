export const DOCKER_CONTAINER_FORMAT = `'{"id":"{{ .ID }}", "image": "{{ .Image }}", "names":"{{ .Names }}",  "ports":"{{ .Ports }}", "createdAt":"{{ .CreatedAt }}", "status":"{{ .Status }}"}'`;

export const DOCKER_CONTAINER_STATS_FORMAT = `'{"cpuPercent":"{{ .CPUPerc }}", "memoryInfo":{"usage":"{{ .MemUsage }}", "usagePercent":"{{ .MemPerc }}"}, "netIO":"{{ .NetIO }}", "blockIO":"{{ .BlockIO }}"}'`;
