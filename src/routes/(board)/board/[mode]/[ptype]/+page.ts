import { error } from '@sveltejs/kit';

export function load({ params }: {params: any}) {
  if ((params.ptype) && (params.mode)) {
    return {
      ptype: params.ptype,
      mode: params.mode
    };
  }

  throw error(404, 'Not found');
}