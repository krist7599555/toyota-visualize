<script lang="ts">
	import * as Csv from '$lib/csv';
	import * as v from 'valibot';
	import * as es from 'es-toolkit';
	import { flip } from 'svelte/animate';

	const SCORE_MODES = [
		{ key: 'score_total', label: 'Total', desc: 'Average of all score\n(PME + EE + PS)' },
		{ key: 'score_PME', label: 'PME', desc: 'Professional & Management Excellence Score' },
		{ key: 'score_EE', label: 'EE', desc: 'Employee Engagement Score' },
		{ key: 'score_PS', label: 'PS', desc: 'Problem Solving Score' }
	] as const;

	let score_mode = $state<'score_total' | 'score_PME' | 'score_EE' | 'score_PS'>('score_total');
	let sort_mode = $state<'section' | 'score_curr'>('section');
	let score_csv = $state(`
department,section,score_PME,score_EE,score_PS
ADM,AC,78,44,61
ADM,BD,52,89,74
ADM,CA,66,63,41
ADM,CP,91,58,82
ADM,EA,40,72,55
ADM,FN,85,39,68
ADM,FP,59,61,94
ADM,HR,73,48,62
ADM,LN,44,77,31
MFG,AJ,67,81,59
MFG,CQ,55,52,88
MFG,EP,82,93,47
MFG,GS,38,66,70
MFG,MD,61,34,55
MFG,P1/GW,74,59,83
MFG,P1/SR,49,71,64
MFG,P2/BP,92,43,51
MFG,P2/GW,58,86,77
MFG,P2/SR,63,55,40
MFG,P3/BP,35,68,91
MFG,P3/GW,80,62,54
MFG,P3/SR,69,41,79
MFG,PA/BP,51,84,46
MFG,PA/GW,76,67,63
MFG,PA/SR,42,53,87
MFG,PL,88,79,59
MFG,QA,65,36,72
MFG,QC/BP,57,90,44
MFG,QC/GW,83,64,68
MFG,QC/SR,46,58,95
MFG,SE/BP,71,75,52
MFG,SE/GW,39,49,61
MFG,SE/SR,84,62,33
MFG,SEO,62,81,76
MFG,TM,54,47,89
MFG,VL,90,73,56
MKT,AD,47,65,42
MKT,CV,72,88,79
MKT,DN,59,31,64
MKT,DX,81,56,51
MKT,EC,34,74,85
MKT,ET,66,42,67
MKT,FS,87,59,40
MKT,GB,53,77,92
MKT,MO,79,63,58
MKT,MP,41,51,74
MKT,PC,68,84,49
MKT,PM,95,46,62
MKT,R1,56,70,37
MKT,R2,70,61,83
MKT,R3,43,92,55
MKT,RD,82,54,69
MKT,SN,64,38,46
MKT,SP,48,80,73
MKT,TS,77,66,51
MKT,VB,52,44,88
SPC,IA,86,72,60
SPC,LD,60,57,78
`);

	const abbrs_data = `
abbr,title,type
ADM,Administration,Department
AC,Accounts,Section
BD,Business Development,Section
CA,Corporate Affairs,Section
CP,Corporate Planning,Section
EA,External Affairs,Section
FN,Finance,Section
FP,Financial Planning,Section
HR,Human Resources,Section
LN,Legal & Compliance,Section
MFG,Manufacturing,Department
AJ,Assembly & Joining,Section
CQ,Central Quality,Section
EP,Engineering & Production,Section
GS,General Services,Section
MD,Maintenance Department,Section
P1/GW,Production Line 1 (Glass Works),Section
P1/SR,Production Line 1 (Steel Rolling),Section
P2/BP,Production Line 2 (Body Paint),Section
P2/GW,Production Line 2 (Glass Works),Section
P2/SR,Production Line 2 (Steel Rolling),Section
P3/BP,Production Line 3 (Body Paint),Section
P3/GW,Production Line 3 (Glass Works),Section
P3/SR,Production Line 3 (Steel Rolling),Section
PA/BP,Product Assembly (Body Paint),Section
PA/GW,Product Assembly (Glass Works),Section
PA/SR,Product Assembly (Steel Rolling),Section
PL,Production Logistics,Section
QA,Quality Assurance,Section
QC/BP,Quality Control (Body Paint),Section
QC/GW,Quality Control (Glass Works),Section
QC/SR,Quality Control (Steel Rolling),Section
SE/BP,Safety & Environment (Body Paint),Section
SE/GW,Safety & Environment (Glass Works),Section
SE/SR,Safety & Environment (Steel Rolling),Section
SEO,Site Operations,Section
TM,Tooling & Maintenance,Section
VL,Vehicle Logistics,Section
MKT,Marketing & Sales,Department
AD,Advertising,Section
CV,Commercial Vehicles,Section
DN,Dealer Network,Section
DX,Digital Transformation,Section
EC,E-Commerce,Section
ET,Emerging Technologies,Section
FS,Field Sales,Section
GB,Global Branding,Section
MO,Marketing Operations,Section
MP,Market Promotion,Section
PC,Product Communications,Section
PM,Product Management,Section
R1,Regional Sales 1,Section
R2,Regional Sales 2,Section
R3,Regional Sales 3,Section
RD,Research & Development,Section
SN,Sales Network,Section
SP,Strategic Planning,Section
TS,Technical Sales,Section
VB,Vendor Branding,Section
SPC,Special Projects,Department
IA,Internal Audit,Section
LD,Learning & Development,Section,
PME,Professional & Management Excellence,Score
EE,Employee Engagement,Score
PS,Problem Solving,Score
`;

	const abbrs = v.parse(
		v.array(
			v.object({
				abbr: v.string(),
				title: v.string(),
				type: v.picklist(['Department', 'Section', 'Score'])
			})
		),
		Csv.parse(abbrs_data)
	);

	const data = $derived.by(() => {
		const scores = v.parse(
			v.array(
				v.pipe(
					v.object({
						department: v.string(),
						section: v.string(),
						score_PME: v.number(),
						score_EE: v.number(),
						score_PS: v.number()
					}),
					v.transform((input) => ({
						...input,
						department_name: abbrs.find((a) => a.abbr == input.department)?.title,
						section_name: abbrs.find((a) => a.abbr == input.section)?.title,
						score_total: Math.floor((input.score_PME + input.score_EE + input.score_PS) / 3)
					})),
					v.transform((input) => ({
						...input,
						score_curr: input[score_mode]
					}))
				)
			),
			Csv.parse(score_csv)
		);

		return {
			scores
		};
	});

	function handleEditScore() {
		score_csv = prompt('ข้อมูลใหม่', score_csv) || score_csv;
	}

	$effect(() => {
		window.onerror = function (message, source, lineno, colno, error) {
			console.error('Caught globally:', message);
			alert(`${message}`);
			return false;
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section
	class="bg-white"
	ondblclick={(e) => {
		if (e.target == e.currentTarget) {
			e.currentTarget.requestFullscreen();
		}
	}}
>
	<div class="mt-4 flex flex-wrap justify-center gap-4">
		<div
			aria-label="Scores Select"
			class="flex w-fit flex-wrap justify-center divide-x divide-slate-300 rounded border border-slate-300 text-balance shadow"
		>
			{#each SCORE_MODES as mode (mode.key)}
				<button
					type="button"
					class="block w-45 py-1 whitespace-pre-line"
					class:bg-green-200={score_mode == mode.key}
					onclick={() => (score_mode = mode.key)}
				>
					{mode.label}
					<div class="text-xs opacity-50">
						{mode.desc}
					</div>
				</button>
			{/each}
		</div>
		<div
			aria-label="Actions"
			class="flex w-fit justify-center divide-x divide-slate-300 rounded border border-slate-300 shadow"
		>
			<button
				type="button"
				class="px-3 py-1"
				class:bg-green-200={sort_mode == 'score_curr'}
				onclick={() => (sort_mode = sort_mode == 'score_curr' ? 'section' : 'score_curr')}
				>เรียงตามคะแนน
			</button>
			<button type="button" class="px-3 py-1" onclick={handleEditScore}> แก้ข้อมูล </button>
		</div>
	</div>
	<div class="mx-auto mt-6 grid w-fit gap-4 sm:grid-cols-2 md:grid-cols-4">
		{#each Object.values(es.groupBy(data.scores, (d) => d.department)) as departments}
			{@const avg_score = Math.floor(
				es.sumBy(departments, (d) => d.score_curr) / departments.length
			)}
			<div>
				<h2 class="text-center font-bold">
					{departments[0].department_name}
					<span class="text-xs">({avg_score}%)</span>
				</h2>

				<div class="mt-2 grid w-fit grid-cols-4 gap-1">
					{#each es.sortBy(departments, [sort_mode]) as sec (sec.section)}
						{@const color =
							sec.score_curr < 30
								? '--color-red-400'
								: sec.score_curr < 50
									? '--color-orange-400'
									: sec.score_curr < 60
										? '--color-yellow-400'
										: sec.score_curr < 70
											? '--color-green-200'
											: '--color-green-400'}
						<div
							animate:flip={{ duration: 900 }}
							class="relative h-20 w-14 rounded border border-slate-300 bg-slate-50 p-0.5 text-xs shadow"
						>
							<div
								class="absolute right-0 bottom-0 left-0 bg-green-400 transition-all duration-1000"
								style="
                  height: {sec.score_curr}%;
                  background-color: var({color})
                "
							></div>
							<div class="absolute bottom-0">
								{sec.section}<br />
								{sec.score_curr}%
							</div>

							<!-- svelte-ignore a11y_consider_explicit_label -->
							<button
								type="button"
								class="absolute inset-0 cursor-pointer"
								onclick={() =>
									alert(
										[
											'',
											`ฝ่าย ${sec.department_name} (${sec.department})`,
											`แผนก ${sec.section_name} (${sec.section})`,
											'',
											`PME = ${sec.score_PME} %`,
											`EE  = ${sec.score_EE} %`,
											`PS  = ${sec.score_PS} %`,
											'',
											`AVG = ${sec.score_total} %`
										].join('\n')
									)}
							>
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>
