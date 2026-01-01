# MCP Tools Guide

Dit document bevat een overzicht van de beschikbare tools en acties voor de geconfigureerde Model Context Protocol (MCP) servers: **GitKraken** en **Sentry**.

## 🐙 GitKraken MCP
Deze server richt zich op Git-versiebeheer en integraties met issue trackers (GitHub, GitLab, Jira).

### Git Operaties
| Tool | Beschrijving |
|------|--------------|
| `git_status` | Toont de status van de working tree (gewijzigde bestanden, branch status). |
| `git_log_or_diff` | Bekijkt commit logs of toont wijzigingen (diffs) tussen commits/bestanden. |
| `git_checkout` | Wisselt van branch of herstelt bestanden in de working tree. |
| `git_branch` | Lijst bestaande branches of maakt nieuwe branches aan. |
| `git_add_or_commit` | Staged bestanden (`git add`) of maakt nieuwe commits (`git commit`). |
| `git_push` | Pusht lokale wijzigingen naar de remote repository. |
| `git_stash` | Stasht tijdelijk lokale wijzigingen. |
| `git_blame` | Toont regel-voor-regel wie wijzigingen heeft aangebracht in een bestand. |
| `git_worktree` | Beheert Git worktrees (het uitchecken van meerdere branches tegelijk). |
| `repository_get_file_content` | Haalt de inhoud van een bestand op van een specifieke revisie/commit. |

### Issues & Pull Requests
| Tool | Beschrijving |
|------|--------------|
| `issues_assigned_to_me` | Vindt issues die aan jou zijn toegewezen (Jira, GitHub, etc.). |
| `issues_get_detail` | Haalt gedetailleerde informatie op van een specifiek issue. |
| `issues_add_comment` | Plaats een commentaar op een issue. |
| `pull_request_create` | Maakt een nieuwe Pull Request aan. |
| `pull_request_get_detail` | Haalt details op van een bestaande Pull Request. |
| `pull_request_get_comments` | Haalt discussies en commentaren op van een PR. |
| `pull_request_create_review` | Plaats een formal review op een PR. |
| `pull_request_assigned_to_me` | Vindt Pull Requests die aan jou zijn toegewezen. |

---

## 🔍 Sentry MCP
Deze server biedt diepe integratie met Sentry voor error monitoring, debugging en AI-analyse met Seer.

### Onderzoek & Debugging
| Tool | Beschrijving |
|------|--------------|
| `search_issues` | Zoekt naar **gegroepeerde issues** (bugs/crashes). Geschikt voor lijsten zoals "unresolved issues". |
| `get_issue_details` | Haalt diepgaande details op van één specifiek issue (stacktraces, tags, context). |
| `search_events` | Zoekt naar **individuele events** of voert tellingen uit (bijv. "hoeveel errors in het laatste uur?"). |
| `search_issue_events` | Zoekt events *binnen* de context van één specifiek issue (bijv. filtering op release). |
| `get_trace_details` | Bekijkt de details van een specifieke performance trace (spans, tijdsduur). |
| `get_event_attachment` | Downloadt bijlagen (zoals screenshots of logbestanden) die bij een event horen. |
| `analyze_issue_with_seer` | **AI Power:** Laat Sentry's Seer een root cause analyse uitvoeren en een fix voorstellen. |

### Beheer
| Tool | Beschrijving |
|------|--------------|
| `update_issue` | Wijzigt de status (Resolved, Ignored) of wijst een issue toe aan een gebruiker/team. |
| `create_project` | Maakt een nieuw project aan in Sentry. |
| `update_project` | Wijzigt instellingen van een bestaand project. |
| `create_dsn` | Genereert een nieuwe DSN sleutel voor een project. |
| `create_team` | Maakt een nieuw team aan binnen de organisatie. |

### Informatie & Documentatie
| Tool | Beschrijving |
|------|--------------|
| `find_organizations` | Lijst de Sentry organisaties waar je toegang tot hebt. |
| `find_projects` | Lijst de projecten binnen een organisatie. |
| `find_teams` | Lijst de teams binnen een organisatie. |
| `find_releases` | Zoekt naar specifieke releases en versies. |
| `whoami` | Toont informatie over de huidige geauthenticeerde gebruiker. |
| `search_docs` | Zoekt in de officiële Sentry documentatie (handig voor SDK setup). |
| `get_doc` | Haalt de volledige inhoud op van een documentatiepagina. |
