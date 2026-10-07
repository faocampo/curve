# Consolidation local branch inventory — 2026-10-07

Scope: all **81 Curve and 48 Plane branches** present in the original checkouts at
inventory time. Local refs are preserved, including merged/superseded historical
heads. Ancestry and exact GitHub PR-head records were inspected; a merged PR
record retains its historical target and does not alone prove current integration.

The [consolidation ledger](project-consolidation-2026-10-07.md) (remote cleanup,
merge evidence and retained exceptions) controls delivery disposition. Historical
preservation exceptions require content/successor review before reuse and are
excluded from the active integration queue. No local branch was deleted.
One historical organization-specific branch name is generalized below to preserve
the public disclosure boundary; its original local ref remains unchanged.

## Curve original checkout

Compared against `e2428ae627c0022fda7a91d8e950b921b6a668c2` (merged reconstruction baseline).

| Local branch | Exact tip | Evidence / disposition |
| --- | --- | --- |
| `agent/d003-local-proof-authorization` | `6411aa3264080a3d258b8adab6926b0448de31d5` | Ancestor of head of merged [PR #3](https://github.com/faocampo/curve/pull/3) (historical branch disposition); retain historical scope |
| `backup/m0-s9b2-c08217a` | `c08217a541ffe58d985560baa9a1908c2070ed50` | Historical local preservation exception; successor/content review required before reuse |
| `backup/pr50-5adacd9` | `5adacd9b86c400ace093ef2d98370e579af025ba` | Historical local preservation exception; successor/content review required before reuse |
| `backup/pr58-e52a853` | `e52a8539d3bf4eb9210776123c45019fce3a3866` | Historical local preservation exception; successor/content review required before reuse |
| `backup/pr58-f80-rebase-7e69e24` | `7e69e24c56f107efd2270d21e66fbd76dbb4e318` | Historical local preservation exception; successor/content review required before reuse |
| `contracts/m0-s9a-independent-review-corrections` | `737c52c52f6f8f8b5f59ec4c69450b2edcacea8d` | Exact head of merged [PR #36](https://github.com/faocampo/curve/pull/36) (historical branch disposition); retain historical scope |
| `contracts/m0-s9a-lifecycle-reconciliation` | `cf1ffb696b30f45e71a6edcaba062f67a3de7b8e` | Exact head of merged [PR #37](https://github.com/faocampo/curve/pull/37) (historical branch disposition); retain historical scope |
| `curve/d003-local-only-governance-reconciliation` | `dd6a01dcf428c18b1fdfc79259c89d623251e5f7` | Exact head of merged [PR #13](https://github.com/faocampo/curve/pull/13) (historical branch disposition); retain historical scope |
| `curve/d003-local-topology-decision` | `7826f4031a6f3862ed29d48c9f16292e8a1ab8bb` | Exact head of merged [PR #9](https://github.com/faocampo/curve/pull/9) (historical branch disposition); retain historical scope |
| `curve/d003-private-platform-connectivity` | `5e165c502f5bf6c1900085be4388495d7c504b48` | Exact head of merged [PR #15](https://github.com/faocampo/curve/pull/15) (historical branch disposition); retain historical scope |
| `curve/d009-contract-integrity-corrections` | `56fd4a549bad171a0e2331f6ee006f969f500dff` | Exact head of merged [PR #54](https://github.com/faocampo/curve/pull/54) (historical branch disposition); retain historical scope |
| `curve/external-prd-checkpoints-v1` | `3b5861401f327a01234d7c27b56e4a6d5384b945` | Exact head of closed [PR #162](https://github.com/faocampo/curve/pull/162) (historical branch disposition); retain historical scope |
| `curve/git-retention-reference-v2` | `e8b1d4b032df6b33933c2be56fa76140a05b17f4` | Exact head of merged [PR #165](https://github.com/faocampo/curve/pull/165) (historical branch disposition); retain historical scope |
| `curve/google-docs-prd-contract` | `a9b33ba1a4cfb47e913de8cf0e7ecdb46ecd7f6b` | Historical local preservation exception; successor/content review required before reuse |
| `curve/governance-erd-reconciliation` | `c14d7bcca12d6589d87c5d7914f8773b8466f484` | Exact head of merged [PR #45](https://github.com/faocampo/curve/pull/45) (historical branch disposition); retain historical scope |
| `curve/later-milestone-decision-readiness` | `f42d30412cd064a275577cea826fa5f3de250d9d` | Exact head of closed [PR #167](https://github.com/faocampo/curve/pull/167) (historical branch disposition); retain historical scope |
| `curve/local-runtime-refresh-evidence` | `400202b76d793e93421c7f13b9f9c6d0604f7df5` | Exact head of merged [PR #47](https://github.com/faocampo/curve/pull/47) (historical branch disposition); retain historical scope |
| `curve/m0-03-policy-contract-readiness` | `cb6f7d95f1c2b5a19b8601ceac019ef48295a68b` | Exact head of merged [PR #7](https://github.com/faocampo/curve/pull/7) (historical branch disposition); retain historical scope |
| `curve/m0-audit-current-state-reconciliation` | `bab5400d0676cb2f8e0b67c2a4b27ae4e850dc90` | Exact head of merged [PR #70](https://github.com/faocampo/curve/pull/70) (historical branch disposition); retain historical scope |
| `curve/m0-s2-contract-readiness` | `215911477e67a2678e595fb9991626a7fb23000a` | Exact head of merged [PR #5](https://github.com/faocampo/curve/pull/5) (historical branch disposition); retain historical scope |
| `curve/m0-s2-post-merge-reconciliation` | `e52ddad1eb57732bf748468d6c992fcb2d087a33` | Exact head of merged [PR #6](https://github.com/faocampo/curve/pull/6) (historical branch disposition); retain historical scope |
| `curve/m0-s3-dispatch-readiness` | `e4052588fe9169c597af7ee6bd34908ea260b442` | Exact head of merged [PR #14](https://github.com/faocampo/curve/pull/14) (historical branch disposition); retain historical scope |
| `curve/m0-s3-implementation-evidence` | `d2d83cac412bc9271ddef0fe81c7afe60cec0540` | Exact head of merged [PR #16](https://github.com/faocampo/curve/pull/16) (historical branch disposition); retain historical scope |
| `curve/m0-s4-curve-first-shell` | `a4638761bcbdb8e522e8db0af5a2ae00cb6480a8` | Exact head of merged [PR #17](https://github.com/faocampo/curve/pull/17) (historical branch disposition); retain historical scope |
| `curve/m0-s4-definition-gate-complete` | `79c7cd6cced82f8f3dede6cbad2706ae3d7befb8` | Exact head of merged [PR #18](https://github.com/faocampo/curve/pull/18) (historical branch disposition); retain historical scope |
| `curve/m0-s4-experience-readiness` | `25ffb7e5af5a8a6cbfdfbbb9b9cbf1393118a6a5` | Historical local preservation exception; successor/content review required before reuse |
| `curve/m0-s5-observability-contract-v2` | `fa6fd677fc41d0bc73a8587e78d33d55a6824429` | Exact head of merged [PR #19](https://github.com/faocampo/curve/pull/19) (historical branch disposition); retain historical scope |
| `curve/m0-s5-observability-readiness` | `6449af3424b42b08bd00f65b5caadfe3c302ff42` | Exact head of closed [PR #11](https://github.com/faocampo/curve/pull/11) (historical branch disposition); retain historical scope |
| `curve/m0-s5-observability-readiness-v2` | `fe26bc90697416b846115741c77d6afb23be7b05` | Contained in audited integration/candidate ancestry |
| `curve/m0-s5a-implementation-evidence` | `0dd2fc6fb06b758f0efe226c056b03352caa3be1` | Exact head of merged [PR #23](https://github.com/faocampo/curve/pull/23) (historical branch disposition); retain historical scope |
| `curve/m0-s6a-acceptance-evidence` | `f8a67dde19aaf1a9758e2a057012d6a4bda6f8bb` | Exact head of merged [PR #32](https://github.com/faocampo/curve/pull/32) (historical branch disposition); retain historical scope |
| `curve/m0-s9-current-baseline` | `5f4e2ccacccf11f08ccef89ef4b2b410d5a9c8a4` | Exact head of merged [PR #72](https://github.com/faocampo/curve/pull/72) (historical branch disposition); retain historical scope |
| `curve/m0-s9a-dispatch-readiness` | `22e7a7ac2335ec1f8fa64cbd25db5424a7a9254a` | Exact head of merged [PR #31](https://github.com/faocampo/curve/pull/31) (historical branch disposition); retain historical scope |
| `curve/m0-s9a-policy-decision-v2-contract` | `059e6e7b0185238f095c85e6a6b328accbaa5ecf` | Exact head of merged [PR #35](https://github.com/faocampo/curve/pull/35) (historical branch disposition); retain historical scope |
| `curve/m0-s9a-provider-registry-readiness` | `075985a01dd2cac30423d7bc239407ef191da7a2` | Exact head of merged [PR #29](https://github.com/faocampo/curve/pull/29) (historical branch disposition); retain historical scope |
| `curve/m0-s9b1-provider-administration-readiness` | `e621c6357e43a12f0755bad622579944a9715643` | Exact head of merged [PR #51](https://github.com/faocampo/curve/pull/51) (historical branch disposition); retain historical scope |
| `curve/m0-s9b2-candidate-profile-contracts` | `ba2c69714df4861294b4b67de67c682579d3cddc` | Exact head of merged [PR #58](https://github.com/faocampo/curve/pull/58) (historical branch disposition); retain historical scope |
| `curve/m0-s9c-r1-traceability-reconciliation` | `7fca751d11e2649d574f1dfc84124850e20d009f` | Exact head of merged [PR #52](https://github.com/faocampo/curve/pull/52) (historical branch disposition); retain historical scope |
| `curve/m0-s9c1a-candidate-model-contracts` | `f9672db38e83e938be6348330ffa306424d469cd` | Exact head of merged [PR #55](https://github.com/faocampo/curve/pull/55) (historical branch disposition); retain historical scope |
| `curve/m1-01a-implementation-evidence` | `044e21c37f3345ca2e17c46f247c0cc51f3e61bd` | Exact head of merged [PR #42](https://github.com/faocampo/curve/pull/42) (historical branch disposition); retain historical scope |
| `curve/m1-01a-initiative-contracts` | `9e5bb5042139746338e22dcfd71c5f975adc4ab6` | Exact head of merged [PR #41](https://github.com/faocampo/curve/pull/41) (historical branch disposition); retain historical scope |
| `curve/m1-01b-dependency-state-proof` | `8510581800ab94e11426884e2c517f4c0c5f5c57` | Exact head of merged [PR #69](https://github.com/faocampo/curve/pull/69) (historical branch disposition); retain historical scope |
| `curve/m1-01b-execution-grant` | `f3f047d9346c16c19e19b7acfdcc10859ea521d4` | Exact head of merged [PR #67](https://github.com/faocampo/curve/pull/67) (historical branch disposition); retain historical scope |
| `curve/m1-01b-implementation-readiness` | `bbff0fb19c219dc66081f44585733a5d03553a89` | Exact head of merged [PR #53](https://github.com/faocampo/curve/pull/53) (historical branch disposition); retain historical scope |
| `curve/m1-01b-initiative-shell-definition` | `5ea50f57aa1e22c16e41cb5ed945ac5ac8da8739` | Exact head of merged [PR #43](https://github.com/faocampo/curve/pull/43) (historical branch disposition); retain historical scope |
| `curve/m1-01b-local-dependency-reuse` | `59d648d8bac6f4af44c885d1217f0dd6f81cd54b` | Exact head of merged [PR #68](https://github.com/faocampo/curve/pull/68) (historical branch disposition); retain historical scope |
| `curve/m1-01b-ordered-evidence` | `5e0162dacafe9544d13064bc652ccd91cd2ec3e5` | Exact head of closed [PR #56](https://github.com/faocampo/curve/pull/56) (historical branch disposition); retain historical scope |
| `curve/m1-01b-ordered-publication` | `eadaaea7849e146705128ddbd862c2eee2036f6f` | Historical local preservation exception; successor/content review required before reuse |
| `curve/m1-01b-ordered-publication-pre-correction` | `53ec20e0cf05992ef09674cd951fa75cafe57a49` | Historical local preservation exception; successor/content review required before reuse |
| `curve/m1-01b-ordered-publication-pre-reference-fix` | `aa6f2b28c03c4553c0bf72a2c6a41f4c25a87e71` | Historical local preservation exception; successor/content review required before reuse |
| `curve/m1-01b-post-publication-ancestry-test` | `23127998750f881d34a0222994a93a2e17e83fdd` | Exact head of merged [PR #64](https://github.com/faocampo/curve/pull/64) (historical branch disposition); retain historical scope |
| `curve/m1-01b-pr-ci-head-compat` | `fd05c5452d2250bea8faf37e73e3e446a9278e42` | Exact head of merged [PR #63](https://github.com/faocampo/curve/pull/63) (historical branch disposition); retain historical scope |
| `curve/m1-01b-stage-c` | `de417a987f7d13d84fc585db4455514c30c071d9` | Exact head of merged [PR #61](https://github.com/faocampo/curve/pull/61) (historical branch disposition); retain historical scope |
| `curve/m1-01b-stage-e1` | `2437c2675ecc7484451e6c600f91a0904b963ca7` | Exact head of merged [PR #59](https://github.com/faocampo/curve/pull/59) (historical branch disposition); retain historical scope |
| `curve/m1-01b-stage-e2` | `f8c3d2f35f7548454d1bd29664dc1824492c3ca6` | Exact head of merged [PR #60](https://github.com/faocampo/curve/pull/60) (historical branch disposition); retain historical scope |
| `curve/m1-01b-stage-p` | `3c43965ef7bc654683d5d8569e680e5dd6e7e244` | Exact head of merged [PR #62](https://github.com/faocampo/curve/pull/62) (historical branch disposition); retain historical scope |
| `curve/m1-01b-stage-s` | `acaad8b6daf97b769b03b47473e2a14745895d98` | Exact head of merged [PR #57](https://github.com/faocampo/curve/pull/57) (historical branch disposition); retain historical scope |
| `curve/m1-m7-codeability-audit` | `b8e02b9579b0ab76daca2aaf04e44b521cd79f88` | Exact head of merged [PR #48](https://github.com/faocampo/curve/pull/48) (historical branch disposition); retain historical scope |
| `curve/m1-m7-packet-governance-v2` | `fe26bc90697416b846115741c77d6afb23be7b05` | Contained in audited integration/candidate ancestry |
| `curve/m1-m7-packet-readiness` | `9c1165f1e5c130f689acf510e42608491c2388e3` | Exact head of merged [PR #8](https://github.com/faocampo/curve/pull/8) (historical branch disposition); retain historical scope |
| `curve/m1-readiness-packets-v1` | `64292ca10c5b82a090edac565b456233866ccfea` | Historical local preservation exception; successor/content review required before reuse |
| `curve/obs-bind-001-local-observability` | `5a3ab82d7b960c862ea83c6ebf89e086be19b758` | Exact head of merged [PR #24](https://github.com/faocampo/curve/pull/24) (historical branch disposition); retain historical scope |
| `curve/p0-05-test-strategy` | `7d2794bad87a6e2e733ee8a53a650d8ea7658d22` | Exact head of merged [PR #27](https://github.com/faocampo/curve/pull/27) (historical branch disposition); retain historical scope |
| `curve/prd-command-policy-v1` | `6049d229e13e0384d0d3e4c88229720da5f296c1` | Ancestor of head of closed [PR #164](https://github.com/faocampo/curve/pull/164) (historical branch disposition); retain historical scope |
| `curve/prd-review-decision-records-v1` | `938b1db9bf597bdca8f671cbab67c66ddd0230b8` | Exact head of closed [PR #163](https://github.com/faocampo/curve/pull/163) (historical branch disposition); retain historical scope |
| `curve/r027-product-persistence-conformance` | `499a1466f93e0839064aad2ee7d9f99d6ee2bfc0` | Contained in audited integration/candidate ancestry |
| `curve/runtime-m0-01-evidence-reconciliation` | `732355005d56e4e1176543d47c3d30e68edcf4ff` | Exact head of merged [PR #66](https://github.com/faocampo/curve/pull/66) (historical branch disposition); retain historical scope |
| `curve/runtime-m0-01-execution-grant-preparation` | `624e9f105c167baf8fe0644a3822591988b1c047` | Exact head of merged [PR #65](https://github.com/faocampo/curve/pull/65) (historical branch disposition); retain historical scope |
| `curve/runtime-m0-01-manual-bootstrap` | `f8e2f4b3d497f747f9e8a3b7db7508510400bae9` | Exact head of merged [PR #50](https://github.com/faocampo/curve/pull/50) (historical branch disposition); retain historical scope |
| `curve/runtime-m0-01-readiness` | `d837c84b6ce8945c16a3e3f8bed8cf2093f1d6f4` | Exact head of merged [PR #49](https://github.com/faocampo/curve/pull/49) (historical branch disposition); retain historical scope |
| `curve/sec-m0-01-closure-evidence` | `d9e50176ff90b2ba9bad20c76fa3a94761e9ab05` | Exact head of merged [PR #71](https://github.com/faocampo/curve/pull/71) (historical branch disposition); retain historical scope |
| `docs/comprehensive-readiness-review-20260906` | `cc58ac5fd396efb2a8a4e8b06c2893465530e9d8` | Exact head of merged [PR #166](https://github.com/faocampo/curve/pull/166) (historical branch disposition); retain historical scope |
| `docs/foundation-merge-reconciliation-2026-08-15` | `638a2e931c0b6dbf93ecd50eb29cf25293c87b9e` | Ancestor of head of merged [PR #4](https://github.com/faocampo/curve/pull/4) (historical branch disposition); retain historical scope |
| `docs/google-docs-public-disclosure-policy` | `499a1466f93e0839064aad2ee7d9f99d6ee2bfc0` | Contained in audited integration/candidate ancestry |
| `docs/m0-code-readiness-2026-08-12` | `24a66ef1c642f91b29648c7fc15712b3ac1f4e4e` | Exact head of merged [PR #1](https://github.com/faocampo/curve/pull/1) (historical branch disposition); retain historical scope |
| `docs/plane-integration-branch` | `77dbfe5f50e0ac3e585dd2b57e687fa425e780e2` | Exact head of merged [PR #169](https://github.com/faocampo/curve/pull/169) (historical branch disposition); retain historical scope |
| `docs/project-consolidation-20261007` | `3e24dce5c1e441c0c3e3ae254f8cb10a11638c59` | Exact head of merged [PR #170](https://github.com/faocampo/curve/pull/170) (historical branch disposition); retain historical scope |
| `docs/repository-delivery-policy-20260906` | `580a68d23987365b64f272b6b2336470d46f0dfd` | Exact head of merged [PR #168](https://github.com/faocampo/curve/pull/168) (historical branch disposition); retain historical scope |
| `main` | `af7b5e872512b34516d451e26de312421eea78ec` | Contained in audited integration/candidate ancestry |
| `reconstruction/manual-planning-v2` | `af5616a5ca990f54943b7b6123c1b3362d0e6486` | Ancestor of head of merged [PR #171](https://github.com/faocampo/curve/pull/171) (historical branch disposition); retain historical scope |
| `security/public-disclosure-cleanup` | `e717f41308bb89a345edbfa53389f74c2993eebc` | Exact head of merged [PR #161](https://github.com/faocampo/curve/pull/161) (historical branch disposition); retain historical scope |

## Plane original checkout

Compared against `1c79ecc891ded4d15fedf2e8f74e1cddd6d8b2fb` (consolidated draft application candidate).

| Local branch | Exact tip | Evidence / disposition |
| --- | --- | --- |
| `chore/curve-integration-branch` | `af2ca68c144d257a0aaf0c1b45d2134067e3636d` | Exact head of merged [PR #44](https://github.com/faocampo/plane/pull/44) (historical branch disposition); retain historical scope |
| `curve/external-document-metadata-v1` | `fef227312a65d3021b4e5cdde73a9cf19ea5c6a7` | Contained in audited integration/candidate ancestry |
| `curve/google-docs-normalization-v1` | `0460c098f3122a42309537b836a4bcf74dc246b9` | Contained in audited integration/candidate ancestry |
| `curve/m0-03-core-policy` | `a807dd7a3f7b81f13ca815b165fba4f4bc068d9e` | Exact head of merged [PR #4](https://github.com/faocampo/plane/pull/4) (historical branch disposition); retain historical scope |
| `curve/m0-foundation-skeleton` | `549db1aea8f3307b337b3686dbb844a87549cd95` | Contained in audited integration/candidate ancestry |
| `curve/m0-policy-decision-time-order` | `413b0ca879f75af5b1f33c942470acb9e52b2fed` | Exact head of merged [PR #9](https://github.com/faocampo/plane/pull/9) (historical branch disposition); retain historical scope |
| `curve/m0-s1-module-shell` | `81712b66e22f1a60883a619c5db63a2101dc365d` | Contained in audited integration/candidate ancestry |
| `curve/m0-s2-delivery-kernel` | `f520075493290389aa54532baec36268c34e2885` | Exact head of merged [PR #3](https://github.com/faocampo/plane/pull/3) (historical branch disposition); retain historical scope |
| `curve/m0-s3-temporal-round-trip` | `7fd231b062dc485b37078979a78ec83618be78d8` | Exact head of merged [PR #5](https://github.com/faocampo/plane/pull/5) (historical branch disposition); retain historical scope |
| `curve/m0-s4-api-sse-ui` | `a1748c790a060434928b8ed521692b13b3f9739e` | Exact head of merged [PR #6](https://github.com/faocampo/plane/pull/6) (historical branch disposition); retain historical scope |
| `curve/m0-s5a-observability-kernel` | `c258ef12221964dae67286e0f6a6c2dc58b997fe` | Exact head of merged [PR #7](https://github.com/faocampo/plane/pull/7) (historical branch disposition); retain historical scope |
| Legacy organization-specific observability branch (name redacted) | `320c4b92b6c9e417410e32a83409a33a64518df0` | Exact head of merged [PR #8](https://github.com/faocampo/plane/pull/8) (historical branch disposition); retain historical scope |
| `curve/m0-s6a-durable-orchestration` | `af8335c42fa3c57e66f76c6ebd80220640630cf8` | Exact head of merged [PR #10](https://github.com/faocampo/plane/pull/10) (historical branch disposition); retain historical scope |
| `curve/m0-s9a-provider-registry-foundation` | `d48a7d09f6824f045a1077ce2de256bd3dcde5d4` | Exact head of merged [PR #12](https://github.com/faocampo/plane/pull/12) (historical branch disposition); retain historical scope |
| `curve/m1-00a-product-core` | `d4ab9ea7c6d19222c316a51d7d2992415c8940f0` | Exact head of merged [PR #13](https://github.com/faocampo/plane/pull/13) (historical branch disposition); retain historical scope |
| `curve/m1-01a-initiative-core` | `7e712e06f41087c013f4a8ed8fd1ff9223f628c4` | Exact head of merged [PR #14](https://github.com/faocampo/plane/pull/14) (historical branch disposition); retain historical scope |
| `curve/m1-01b-initiative-shell` | `0dfbee467935b6330d28f8868cb4e37a934f0526` | Contained in audited integration/candidate ancestry |
| `curve/plane-upstream-sync-2026-08-12` | `b41d4bd46276ec179c06db71a062f1ab975c7005` | Active original checkout with user package-manager edit; preserve |
| `curve/prd-acceptance-api-v1` | `3df703bcdb0292419ba8b6ba4d12d9300639f36d` | Contained in audited integration/candidate ancestry |
| `curve/prd-checkpoint-persistence-v1` | `2d0059c1a245f76312b60d7a0944b690646b8471` | Contained in audited integration/candidate ancestry |
| `curve/prd-command-git-retention-v2` | `db7a1e1654cdd92cc5b502c74469d43ce25d6c9d` | Two local-only command-edition commits; migration collision and pinned-runtime successor required; backlog reference |
| `curve/prd-command-input-v1` | `5a817aa3d3b30313fd957726dda7d1746a1e5fa0` | Contained in audited integration/candidate ancestry |
| `curve/prd-command-policy-v1` | `dff19f75707a332c7a7112ee20befa8583f85da1` | Contained in audited integration/candidate ancestry |
| `curve/prd-completion-service-v1` | `33647dbb1852408447f8120bd3854dd7bf0e5944` | Contained in audited integration/candidate ancestry |
| `curve/prd-durable-command-v1` | `a4562978c9253c553960c8d9013afbc29ea5bf94` | Contained in audited integration/candidate ancestry |
| `curve/prd-evidence-git-retention-v2` | `6e7c923f6759575d955d1a996ec4860f0898beb3` | Contained in audited integration/candidate ancestry |
| `curve/prd-evidence-records-v1` | `74e54a75bc5fc71be6b86c761e6b74a490565214` | Contained in audited integration/candidate ancestry |
| `curve/prd-git-retention-persistence-v2` | `7eaf3feebb557d4e3f1a786f8c27f2d7d753594c` | Contained in audited integration/candidate ancestry |
| `curve/prd-lifecycle-transactions-v1` | `8447ce2314900f28b33da99b12bb3bb16da79377` | Contained in audited integration/candidate ancestry |
| `curve/prd-rationale-git-retention-v2` | `fc55e6b7260ac1d6a408e6cf7d8b963e8b776481` | Contained in audited integration/candidate ancestry |
| `curve/prd-readiness-evaluator-v1` | `7d2979df773dd334585b3ff57027f489a0b45e90` | Contained in audited integration/candidate ancestry |
| `curve/prd-readiness-records-v1` | `bd17e6f92d1f06df0a563f55703007575d3a074b` | Contained in audited integration/candidate ancestry |
| `curve/prd-readiness-submission-v1` | `99f9f2aae037b7e8124ccdecd518358d66383f97` | Contained in audited integration/candidate ancestry |
| `curve/prd-review-decision-persistence-v1` | `c0ff08813cede59693639440ddd2cc183a31fabf` | Contained in audited integration/candidate ancestry |
| `curve/prd-review-subject-validation-v1` | `0eee34b835429d57ae152e4cee3a64442cec107e` | Contained in audited integration/candidate ancestry |
| `curve/prd-temporal-delivery-v1` | `fdcb8da0bec8d2db81f253127d4722c05d54d39b` | Contained in audited integration/candidate ancestry |
| `curve/public-contract-consumer-v1` | `6cca2a8d72d6a82faf7eee599bc1b1cae4c65d58` | Contained in audited integration/candidate ancestry |
| `curve/runtime-m0-01-graceful-worker-shutdown` | `88921d95e8b5b997d2578a170fe79e260b61c8c2` | Exact head of merged [PR #15](https://github.com/faocampo/plane/pull/15) (historical branch disposition); retain historical scope |
| `curve/temporal-cancellation-tests-v1` | `358e2f5fe5d6130b8a81018177a9ecfb6b0e7c19` | Contained in audited integration/candidate ancestry |
| `docs/repository-delivery-policy-20260906` | `bac3e238954fc5750d7d1c80f3c8b2ec3a89883c` | Exact head of merged [PR #41](https://github.com/faocampo/plane/pull/41) (historical branch disposition); retain historical scope |
| `fix/codeql-high-findings` | `25500680cd610dd6de52ec37befa54752781cd0b` | Exact head of merged [PR #16](https://github.com/faocampo/plane/pull/16) (historical branch disposition); retain historical scope |
| `fix/local-minio-public-endpoint` | `bc231cb023b2b6c9ba862f52dfd30d0288c6b874` | Exact head of merged [PR #11](https://github.com/faocampo/plane/pull/11) (historical branch disposition); retain historical scope |
| `fix/quicklink-license-headers` | `3251c10dd28ccf929d126a04a267b7c75e6e1d69` | Exact head of merged [PR #42](https://github.com/faocampo/plane/pull/42) (historical branch disposition); retain historical scope |
| `fix/quicklink-url-validation` | `74b902c97c2ea0df8ce82529077072670229205f` | Exact head of merged [PR #19](https://github.com/faocampo/plane/pull/19) (historical branch disposition); retain historical scope |
| `fix/sec-m0-01-high-production-dependencies` | `1c8ac9a9f122a08bcf56961b1fb933992c6bb48e` | Exact head of merged [PR #18](https://github.com/faocampo/plane/pull/18) (historical branch disposition); retain historical scope |
| `fix/web-validation-manual-dispatch` | `81b09c26111289ba025ab2600ff915e321e2802a` | Exact head of merged [PR #43](https://github.com/faocampo/plane/pull/43) (historical branch disposition); retain historical scope |
| `integration/consolidation-20261007` | `a6b0a8db15c42625712d083b8022cd4011eef892` | Contained in audited integration/candidate ancestry |
| `preview` | `922dd6de5d5ed5081f35cd88343154022867ccad` | Contained in audited integration/candidate ancestry |

## Additional restored checkouts

- Restored Curve: active reconstruction head `af5616a5ca990f54943b7b6123c1b3362d0e6486`
  and checkpoint `b2d8cb8993ec66a1bf5cb33a038f16751f10fa36` preserved; reconstruction
  incorporated through PR #171.
- Restored Plane: active existing-project head `a6b0a8db15c42625712d083b8022cd4011eef892`
  preserved and contained in PR #17. Detached review head
  `8aede16b4aee1aa66eb0b9469c4c849b34250f6e` backs the preserved demo.
- Local pilot recovery head `f2be82077e6d20ec24befbf578dde47736f94cb3`: five commits
  incorporated into PR #17 with original ancestry; original checkout retained.
- Private governance: one canonical remote branch, no local-only commits;
  environment-specific inventory remains private.
- Isolated consolidation worktrees and exact-tip archive refs remain available
  for review/recovery. They are not additional product workstreams.
