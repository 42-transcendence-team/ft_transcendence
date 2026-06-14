all: run

debug: run_debug
	

venv:
	python3 -m venv .venv

requirements:
	.venv/bin/pip install -r requirements.txt

config: venv requirements

remove:
	rm -rf .venv

re: remove config
	
run: config
	.venv/bin/pytest		


run_debug: config
	.venv/bin/pytest -s
