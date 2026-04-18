import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createSegment, updateSegment, getSegment } from '../services/api';

const FIELDS = [
  { value: 'deposit_amount', label: 'Deposit Amount', type: 'number' },
  { value: 'deposit_count', label: 'Deposit Count', type: 'number' },
  { value: 'withdraw_amount', label: 'Withdraw Amount', type: 'number' },
  { value: 'withdraw_count', label: 'Withdraw Count', type: 'number' },
  { value: 'wagering_amount', label: 'Wagering Amount', type: 'number' },
  { value: 'wagering_count', label: 'Wagering Count', type: 'number' },
  { value: 'win_amount', label: 'Win Amount', type: 'number' },
  { value: 'gross_gaming_revenue', label: 'Gross Gaming Revenue', type: 'number' },
  { value: 'players_status', label: 'Players Status', type: 'select', options: ['active', 'suspended', 'inactive'] },
  { value: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'other'] },
  { value: 'age', label: 'Age', type: 'number' },
  { value: 'signup', label: 'Signup', type: 'date' },
  { value: 'last_login', label: 'Last Login', type: 'date' },
];

const OPERATORS_FOR_TYPE = {
  number: [
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' },
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '=', label: '=' },
    { value: '!=', label: '!=' },
    { value: 'between', label: 'Between' },
  ],
  date: [
    { value: '>=', label: 'After (>=)' },
    { value: '<=', label: 'Before (<=)' },
    { value: '=', label: 'On' },
    { value: 'between', label: 'Between' },
  ],
  select: [
    { value: '=', label: 'Is' },
    { value: '!=', label: 'Is Not' },
  ],
};

const emptyCondition = () => ({ field: 'deposit_amount', operator: '>=', value: '', value2: '' });

const getFieldDef = (field) => FIELDS.find(f => f.value === field) || FIELDS[0];

const SegmentEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { segmentId } = useParams();
  const isNew = !segmentId || segmentId === 'new';

  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [conditions, setConditions] = useState([emptyCondition()]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      getSegment(segmentId).then(r => {
        const s = r.segment;
        setName(s.name);
        setComment(s.comment || '');
        setConditions(Array.isArray(s.conditions) && s.conditions.length > 0
          ? s.conditions.map(c => ({ ...emptyCondition(), ...c }))
          : [emptyCondition()]
        );
      }).catch(() => navigate('/segments')).finally(() => setLoading(false));
    }
  }, [segmentId, isNew, navigate]);

  const setCondition = (index, key, val) => {
    setConditions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      // If field changes, reset operator to first valid one
      if (key === 'field') {
        const def = getFieldDef(val);
        const ops = OPERATORS_FOR_TYPE[def.type] || OPERATORS_FOR_TYPE.number;
        next[index].operator = ops[0].value;
        next[index].value = '';
        next[index].value2 = '';
      }
      return next;
    });
  };

  const addCondition = () => setConditions(prev => [...prev, emptyCondition()]);
  const removeCondition = (i) => setConditions(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { alert('Segment name is required'); return; }
    const validConditions = conditions.filter(c => c.field && c.operator && c.value !== '');
    if (validConditions.length === 0) { alert('Add at least one condition'); return; }

    setSubmitting(true);
    try {
      const payload = { name: name.trim(), comment: comment.trim() || null, conditions: validConditions };
      if (isNew) {
        await createSegment(payload);
      } else {
        await updateSegment(segmentId, payload);
      }
      navigate('/segments');
    } catch (err) {
      alert(err.message || 'Failed to save segment');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/segments')}>{t('segments.backToSegments')}</button>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>
          {isNew ? t('segments.createSegmentation') : t('segments.editSegmentation')}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Name + Comment */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="grid grid-2 gap-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('segments.segmentName')} *</label>
              <input
                className="form-input"
                placeholder={t('segments.segmentName')}
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('segments.comment')} *</label>
              <input
                className="form-input"
                placeholder={t('segments.comment')}
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Conditions */}
        {conditions.map((cond, i) => {
          const fieldDef = getFieldDef(cond.field);
          const operators = OPERATORS_FOR_TYPE[fieldDef.type] || OPERATORS_FOR_TYPE.number;
          const isBetween = cond.operator === 'between';

          return (
            <div key={i} className="card" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                {/* Field */}
                <div className="form-group" style={{ flex: '2', minWidth: '180px', marginBottom: 0 }}>
                  <label className="form-label">{t('segments.field')} *</label>
                  <select
                    className="form-select"
                    value={cond.field}
                    onChange={e => setCondition(i, 'field', e.target.value)}
                  >
                    {FIELDS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                {/* Operator */}
                <div className="form-group" style={{ flex: '1', minWidth: '130px', marginBottom: 0 }}>
                  <label className="form-label">{t('segments.operator')} *</label>
                  <select
                    className="form-select"
                    value={cond.operator}
                    onChange={e => setCondition(i, 'operator', e.target.value)}
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>

                {/* Value */}
                <div className="form-group" style={{ flex: '1', minWidth: '140px', marginBottom: 0 }}>
                  <label className="form-label">{isBetween ? t('segments.from') : t('segments.value')} *</label>
                  {fieldDef.type === 'select' ? (
                    <select
                      className="form-select"
                      value={cond.value}
                      onChange={e => setCondition(i, 'value', e.target.value)}
                    >
                      <option value="">Select…</option>
                      {fieldDef.options.map(o => (
                        <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="form-input"
                      type={fieldDef.type === 'date' ? 'date' : 'number'}
                      step={fieldDef.type === 'number' ? 'any' : undefined}
                      value={cond.value}
                      onChange={e => setCondition(i, 'value', e.target.value)}
                      placeholder={fieldDef.type === 'number' ? '0' : ''}
                    />
                  )}
                </div>

                {/* Value2 (between only) */}
                {isBetween && (
                  <div className="form-group" style={{ flex: '1', minWidth: '140px', marginBottom: 0 }}>
                    <label className="form-label">{t('segments.to')} *</label>
                    <input
                      className="form-input"
                      type={fieldDef.type === 'date' ? 'date' : 'number'}
                      step={fieldDef.type === 'number' ? 'any' : undefined}
                      value={cond.value2 || ''}
                      onChange={e => setCondition(i, 'value2', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                )}

                {/* Remove */}
                {conditions.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{ marginBottom: 0, alignSelf: 'flex-end', height: '38px' }}
                    onClick={() => removeCondition(i)}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add condition + Submit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addCondition}
          >
            {t('segments.addCondition')}
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/segments')}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '120px' }}>
              {submitting ? t('segments.saving') : (isNew ? t('common.create') : t('common.saveChanges'))}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SegmentEdit;
