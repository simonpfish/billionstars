from astroquery.gaia import Gaia

job = Gaia.launch_job("select top 100000 \
source_id,l,b,parallax,radius_val,lum_val,teff_val,astrometric_pseudo_colour \
from gaiadr2.gaia_source \
where radius_val is not null \
order by source_id", dump_to_file=True, output_format='csv')


print(job)
